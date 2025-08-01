import UserService from "../../services/userService";
import { Request, Response } from "express";
import { IUser } from "../../interfaces/user/userInterface";
import HTTP_statusCode from "../../enums/httpStatusCode";
const stripe = require('stripe')("sk_test_51R6U86C1BfcS3nBm3F9VPOzMitLY6kndB9xIywEvFDKrPi8jDQ457NySmoSq2Nl0hBdT8vtGMvNZ5Wr8cNq736Kk00RPBZDxXt")
import cloudinary from '../../config/cloudinary_config'
import { IUserService } from "../../interfaces/user/IUserService";
import { log } from "console";
import { get } from "https";



class userController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: IUser = req.body;
      await this.userService.register(userData);
      res.status(HTTP_statusCode.OK).send("OTP sent to mail");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email already exists") {
          res
            .status(HTTP_statusCode.Conflict)
            .json({ message: "Email already exists" });
        } else if (error.message === "Email not send") {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Email not send" });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Something wrong please try again later" });
        }
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Unknown error occurred" });
      }
    }
  };

  otpVerification = async (req: Request, res: Response) => {
    try {

      const enteredOtp: { enteredOtp: string } = req.body.enteredOtp;


      const serviceResponse = await this.userService.otpVerification(
        enteredOtp
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Incorrect OTP") {
          res
            .status(HTTP_statusCode.Unauthorized)
            .json({ message: "Incorrect OTP" });
        } else if (error.message === "OTP is expired") {
          res.status(HTTP_statusCode.Expired).json({ message: "OTP is expired" });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Something went wrong. Please try again later." });
        }
      }

    }
  };

  resendOtp = async (req: Request, res: Response) => {
    try {
      await this.userService.resendOTP();
      res.status(HTTP_statusCode.OK).send("OTP sended");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Incorrect OTP") {
          res
            .status(HTTP_statusCode.Unauthorized)
            .json({ message: "Incorrect OTP" });
        } else if (error.message === "OTP is expired") {
          res.status(HTTP_statusCode.Expired).json({ message: "OTP is expired" });
        } else {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json({ message: "Something went wrong. Please try again later." });
        }
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {

      const { email, password } = req.body

      const serviceResponse = await this.userService.login(email, password);

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
        if (error.message === "Email not found") {
          res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
        } else if (error.message === "Wrong password") {
          res.status(HTTP_statusCode.Unauthorized).json({ message: "Wrong password" });
        } else if (error.message === "User is blocked") {
          res.status(HTTP_statusCode.NoAccess).json({ message: "User is blocked" });
        } else {
          res.status(HTTP_statusCode.InternalServerError).json({ message: "Something wrong please try again later" });
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

      const result = await this.userService.getVerifiedDoctors(
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
      res.status(500).json({ message: "Something went wrong", error });
    }
  };


  logoutUser = async (req: Request, res: Response) => {


    try {
      res.clearCookie("UserAccessToken", { httpOnly: true, secure: true, sameSite: 'none' });
      res.clearCookie("UserRefreshToken", { httpOnly: true, secure: true, sameSite: 'none' });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };

  createcheckoutsession = async (req: Request, res: Response) => {
    console.log("stripe checkout")
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
      const saveData = await this.userService.saveBookingToDb(slotId, userId, doctorId)
    } catch (error) {
      throw error
    }
  }

  getUserBookings = async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId
      const getBookingData = await this.userService.getUserBookings(userId)
      // console.log("getBookingData ",getBookingData);

      res.status(HTTP_statusCode.OK).json(getBookingData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };

  cancelBooking = async (req: Request, res: Response) => {
    try {
      const bookingId = req.body.bookingId
      const cancelBookingData = await this.userService.cancelBooking(bookingId)
      res.status(HTTP_statusCode.OK).json(cancelBookingData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  }


  getWalletData = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const getData = await this.userService.getWalletData(userId, page, limit);
      res.status(HTTP_statusCode.OK).json(getData);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({
        message: "Something went wrong",
        error,
      });
    }
  };


  updateUser = async (req: Request, res: Response) => {
    try {

      const userData = req.body
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
      const imgObject: { [key: string]: string } = {};

      for (const file of fileName!) {
        const upload: string = await uploadToCloudinary(file.buffer) as string

        imgObject[file.fieldname] = upload

      }

      const docData = await this.userService.updateUserProfile(userData, imgObject)
      res.status(HTTP_statusCode.OK).json(docData)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(400).json({ error: 'An unexpected error occurred' });
    }

  };

  getUser = async (req: Request, res: Response) => {
    try {
      const { email } = req.params

      const getUserData = await this.userService.getUser(email)
      res.status(HTTP_statusCode.OK).json(getUserData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  }

  bookedDoctors = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.user_id
      const Userdata = await this.userService.getBookedDoctors(userId)
      res.status(HTTP_statusCode.OK).json(Userdata)

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }

  };

  messages = async (req: Request, res: Response) => {
    try {
      const { receiverId, senderId } = req.query;

      const getData = await this.userService.getMessages(receiverId as any, senderId as any)
      res.status(HTTP_statusCode.OK).json(getData)

    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };


  saveMessages = async (req: Request, res: Response) => {
    try {
      const messageData = req.body
      const saveData = await this.userService.saveMessages(messageData)
      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
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
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };


  deleteMessage = async (req: Request, res: Response) => {

    const messageId = req.query.id
    try {
      const data = await this.userService.deleteMessage(messageId as string)
      res.status(HTTP_statusCode.OK).json(data)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }

  };

  walletBooking = async (req: Request, res: Response) => {
    try {
      const slotId = req.body.slotId
      const userId = req.body.userId
      const doctorId = req.body.doctorId
      const doctorFees = req.body.doctorFees

      const saveData = await this.userService.saveWalletBookingToDb(slotId, userId, doctorId, doctorFees)
      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error: any) {
      res.status(HTTP_statusCode.InternalServerError).json(error.message);
    }

  };

  submitReview = async (req: Request, res: Response) => {
    try {
      const reviewData = req.body
      const saveData = await this.userService.submitReview(reviewData)

      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };

  reviewDetails = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.query


      const saveData = await this.userService.reviewDetails(doctorId as string)

      res.status(HTTP_statusCode.OK).json(saveData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
    }
  };

  getDoctorSlotsForBooking = async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const getData = await this.userService.getDoctorSlotsForBooking(doctorId)
    res.status(HTTP_statusCode.OK).json(getData);

  };

  getPrescription = async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.query

      const presData = await this.userService.getPrescription(bookingId as string)

      res.status(HTTP_statusCode.OK).json(presData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });

    }
  };
}


export default userController;
