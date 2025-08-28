import UserService from "../../services/userService";
import { Request, Response } from "express";
import { IUser } from "../../interfaces/user/userInterface";
import HTTP_statusCode from "../../enums/httpStatusCode";
const stripe = require('stripe')("sk_test_51R6U86C1BfcS3nBm3F9VPOzMitLY6kndB9xIywEvFDKrPi8jDQ457NySmoSq2Nl0hBdT8vtGMvNZ5Wr8cNq736Kk00RPBZDxXt")
import cloudinary from '../../config/cloudinary_config'
import { IUserService } from "../../interfaces/user/IUserService";
import { RESPONSE_MESSAGES } from "../../constants/messages";


class userController {
  private _userService: IUserService;

  constructor(userService: IUserService) {
    this._userService = userService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: IUser = req.body;
      await this._userService.register(userData);
      res.status(HTTP_statusCode.OK).send(RESPONSE_MESSAGES.USER.OTP_SENT_TO_MAIL);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === RESPONSE_MESSAGES.USER.EMAIL_ALREADY_EXISTS) {
          res
            .status(HTTP_statusCode.Conflict)
            .json({ message: RESPONSE_MESSAGES.USER.EMAIL_ALREADY_EXISTS });
        } else if (error.message === RESPONSE_MESSAGES.USER.EMAIL_NOT_SENT) {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: RESPONSE_MESSAGES.USER.EMAIL_NOT_SENT });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: RESPONSE_MESSAGES.USER.SOMETHING_WENT_WRONG });
        }
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: RESPONSE_MESSAGES.USER.UNKNOWN_ERROR });
      }
    }
  };

  otpVerification = async (req: Request, res: Response) => {
    try {

      const enteredOtp: { enteredOtp: string } = req.body.enteredOtp;


      const serviceResponse = await this._userService.otpVerification(
        enteredOtp
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === RESPONSE_MESSAGES.USER.INCORRECT_OTP) {
          res
            .status(HTTP_statusCode.Unauthorized)
            .json({ message: RESPONSE_MESSAGES.USER.INCORRECT_OTP });
        } else if (error.message === RESPONSE_MESSAGES.USER.OTP_EXPIRED) {
          res.status(HTTP_statusCode.Expired).json({ message: RESPONSE_MESSAGES.USER.OTP_EXPIRED });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: RESPONSE_MESSAGES.USER.SOMETHING_WENT_WRONG_OTP_VERIFICATION });
        }
      }

    }
  };

  resendOtp = async (req: Request, res: Response) => {
    try {
      await this._userService.resendOTP();
      res.status(HTTP_statusCode.OK).send(RESPONSE_MESSAGES.USER.OTP_SENT);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === RESPONSE_MESSAGES.USER.INCORRECT_OTP) {
          res
            .status(HTTP_statusCode.Unauthorized)
            .json({ message: RESPONSE_MESSAGES.USER.INCORRECT_OTP });
        } else if (error.message === RESPONSE_MESSAGES.USER.OTP_EXPIRED) {
          res.status(HTTP_statusCode.Expired).json({ message: RESPONSE_MESSAGES.USER.OTP_EXPIRED });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: RESPONSE_MESSAGES.USER.SOMETHING_WENT_WRONG_OTP_VERIFICATION });
        }
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {

      const { email, password } = req.body

      const serviceResponse = await this._userService.login(email, password);

      res.cookie("UserRefreshToken", serviceResponse.userRefreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("UserAccessToken", serviceResponse.userToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 48 * 60 * 60 * 1000,
      });

      res.json({ userData: serviceResponse.userData });


    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === RESPONSE_MESSAGES.USER.EMAIL_NOT_FOUND) {
          res.status(HTTP_statusCode.NotFound).json({ message: RESPONSE_MESSAGES.USER.EMAIL_NOT_FOUND });
        } else if (error.message === RESPONSE_MESSAGES.USER.WRONG_PASSWORD) {
          res.status(HTTP_statusCode.Unauthorized).json({ message: RESPONSE_MESSAGES.USER.WRONG_PASSWORD });
        } else if (error.message === RESPONSE_MESSAGES.USER.USER_BLOCKED) {
          res.status(HTTP_statusCode.NoAccess).json({ message: RESPONSE_MESSAGES.USER.USER_BLOCKED });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.USER.SOMETHING_WENT_WRONG });
        };
      }
    };


  }


  getVerifiedDoctors = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const sort = (req.query.sort as string) || "";
      const departments = req.query.departments
        ? (req.query.departments as string).split(",")
        : [];

      const minFee = parseInt(req.query.minFee as string) || 0;
      const maxFee = parseInt(req.query.maxFee as string) || 10000;

      const result = await this._userService.getVerifiedDoctors(
        page,
        limit,
        search,
        sort,
        departments,
        minFee,
        maxFee
      );


      res.status(200).json({
        data: result.data,
        total: result.total,
        page,
        limit,
      });
    } catch (error) {
      res.status(500).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };


  logoutUser = async (req: Request, res: Response) => {
    try {
      res.clearCookie("UserAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
      res.clearCookie("UserRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
      res.status(200).json({ message: RESPONSE_MESSAGES.USER.LOGOUT_SUCCESS });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };

  createcheckoutsession = async (req: Request, res: Response) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:1234/success?slotId=${req.body.slotId}&userId=${req.body.userInfo._id}&doctorId=${req.body.doctorId}`,
      cancel_url: "http://localhost:1234/paymentFailed",

      // success_url: `https://home-care-frontend-five.vercel.app/success?slotId=${req.body.slotId}&userId=${req.body.userInfo._id}&doctorId=${req.body.doctorId}`,
      // cancel_url: "https://home-care-frontend-five.vercel.app/paymentFailed",
      customer_email: req.body.userEmail, // Optional: associate user with payment
      line_items: [
        {
          price_data: {
            currency: "inr", // Change based on your currency
            product_data: {
              name: `Consultation with Dr. ${req.body.doctorName}`,
              description: `Appointment on ${req.body.selectedDate} at ${req.body.startTime}`,
              images: [req.body.doctorImage], // Optional: Display doctor's image
            },
            unit_amount: Math.round(req.body.doctorFees * 100), // Convert to cents
          },
          quantity: 1, // Always 1 for a single appointment
        },
      ],
    });


    res.json({ id: session.id })
  }


  saveBookingToDb = async (req: Request, res: Response) => {
    try {
      const slotId = req.body.slotId
      const userId = req.body.userId
      const doctorId = req.body.doctorId
      const saveData = await this._userService.saveBookingToDb(slotId, userId, doctorId)
    } catch (error) {
      throw error
    }
  }

  getUserBookings = async (req: Request, res: Response) => {
    try {


      const userId = req.body.userId
      const getBookingData = await this._userService.getUserBookings(userId)

      res.status(HTTP_statusCode.OK).json(getBookingData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };

  cancelBooking = async (req: Request, res: Response) => {
    try {
      const bookingId = req.body.bookingId
      const cancelBookingData = await this._userService.cancelBooking(bookingId)
      res.status(HTTP_statusCode.OK).json(cancelBookingData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  }


  getWalletData = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const getData = await this._userService.getWalletData(userId, page, limit);
      res.status(HTTP_statusCode.OK).json(getData);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG,
        error,
      });
    }
  };


  // updateUser = async (req: Request, res: Response) => {
  //   try {

  //     const userData = req.body
  //     const fileName = req.files as Express.Multer.File[]

  //     let uploadToCloudinary = (buffer: Buffer) => {

  //       return new Promise((resolve, reject) => {
  //         const uploadStream = cloudinary.uploader.upload_stream(
  //           { folder: "doctor_profiles" }, // Cloudinary folder
  //           (error, result) => {
  //             if (error) {
  //               reject(error);
  //             } else {
  //               resolve(result?.secure_url); // Return uploaded image URL
  //             }
  //           }
  //         );
  //         uploadStream.end(buffer); // Send buffer data to Cloudinary
  //       });



  //     };
  //     const imgObject: { [key: string]: string } = {};

  //     for (const file of fileName!) {
  //       const upload: string = await uploadToCloudinary(file.buffer) as string

  //       imgObject[file.fieldname] = upload

  //     }

  //     const docData = await this._userService.updateUserProfile(userData, imgObject)
  //     res.status(HTTP_statusCode.OK).json(docData)
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       return res.status(400).json({ error: error.message });
  //     }

  //     return res.status(400).json({ error: 'An unexpected error occurred' });
  //   }

  // };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const files = req.files as Express.Multer.File[];

      // Helper to upload image as 'authenticated' and return public_id
      const uploadToCloudinary = (buffer: Buffer, filename: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'doctor_profiles',
              public_id: filename,
              type: 'authenticated', // ensures URL must be signed to access
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result?.public_id) {
                console.log('Cloudinary upload result:', result);
                resolve(result.public_id as string); // This will be like "doctor_profiles/vis.jpg"
              } else {
                reject(new Error('Upload failed with no public_id'));
              }
            }
          );
          uploadStream.end(buffer);
        });
      };

      const imgObject: { [key: string]: string } = {};

      for (const file of files) {
        // Step 1: Upload the image and get the full public_id (including folder)
        const filenameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
        const publicId = await uploadToCloudinary(file.buffer, filenameWithoutExt);


        // Step 2: Generate signed URL for the uploaded image
        const signedUrl = cloudinary.url(publicId, {
          resource_type: 'image',          // important!
          type: 'authenticated',
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        });

        // Step 3: Store the signed URL
        imgObject[file.fieldname] = signedUrl;
      }

      // Step 4: Update user profile and include signed image URL
      const docData = await this._userService.updateUserProfile(userData, imgObject);

      return res.status(HTTP_statusCode.OK).json(docData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: RESPONSE_MESSAGES.USER.UNEXPECTED_ERROR });
    }
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const { email } = req.params

      const getUserData = await this._userService.getUser(email)
      res.status(HTTP_statusCode.OK).json(getUserData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  }

  bookedDoctors = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.user_id
      const Userdata = await this._userService.getBookedDoctors(userId)
      res.status(HTTP_statusCode.OK).json(Userdata)

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }

  };

  messages = async (req: Request, res: Response) => {
    try {
      const { receiverId, senderId } = req.query;

      const getData = await this._userService.getMessages(receiverId as string, senderId as string)
      res.status(HTTP_statusCode.OK).json(getData)

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };


  saveMessages = async (req: Request, res: Response) => {
    try {
      const messageData = req.body
      const saveData = await this._userService.saveMessages(messageData)
      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };

  uploadImage = async (req: Request, res: Response) => {
    try {
      const fileName = req.files as Express.Multer.File[]

      let uploadToCloudinary = (buffer: Buffer) => {


        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "doctor_profiles" }, // Cloudinary folder
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result?.secure_url); // Return uploaded image URL
              }
            }
          );
          uploadStream.end(buffer); // Send buffer data to Cloudinary
        });


      };
      const imgObject: any = {}

      for (const file of fileName!) {
        const upload: any = await uploadToCloudinary(file.buffer)
        res.status(HTTP_statusCode.OK).json(upload)
      }
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };


  deleteMessage = async (req: Request, res: Response) => {

    const messageId = req.query.id
    try {
      const data = await this._userService.deleteMessage(messageId as string)
      res.status(HTTP_statusCode.OK).json(data)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }

  };

  walletBooking = async (req: Request, res: Response) => {
    try {
      const slotId = req.body.slotId
      const userId = req.body.userId
      const doctorId = req.body.doctorId
      const doctorFees = req.body.doctorFees

      const saveData = await this._userService.saveWalletBookingToDb(slotId, userId, doctorId, doctorFees)
      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);

        res.status(HTTP_statusCode.InternalServerError).json({ message: error.message });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.USER.WALLET_BOOKING_UNEXPECTED_ERROR });
      }
    }


  };

  submitReview = async (req: Request, res: Response) => {
    try {
      const reviewData = req.body
      const saveData = await this._userService.submitReview(reviewData)

      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };

  reviewDetails = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.query


      const saveData = await this._userService.reviewDetails(doctorId as string)

      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });
    }
  };

  getDoctorSlotsForBooking = async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const getData = await this._userService.getDoctorSlotsForBooking(doctorId)
    res.status(HTTP_statusCode.OK).json(getData);

  };

  getPrescription = async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.query

      const presData = await this._userService.getPrescription(bookingId as string)

      res.status(HTTP_statusCode.OK).json(presData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: RESPONSE_MESSAGES.COMMON.SOMETHING_WENT_WRONG, error });

    }
  };
}


export default userController;
