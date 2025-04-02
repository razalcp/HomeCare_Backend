import UserService from "../../services/userService";
import { Request, Response } from "express";
import { IUser } from "../../interfaces/user/userInterface";
import HTTP_statusCode from "../../enums/httpStatusCode";
const stripe = require('stripe')("sk_test_51R6U86C1BfcS3nBm3F9VPOzMitLY6kndB9xIywEvFDKrPi8jDQ457NySmoSq2Nl0hBdT8vtGMvNZ5Wr8cNq736Kk00RPBZDxXt")

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
//   apiVersion: "2023-10-16" as any,
// });

class userController {
  private userService: UserService;

  constructor(userService: UserService) {
    console.log(process.env.STRIPE_SECRET_KEY);

    this.userService = userService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: IUser = req.body;
      await this.userService.register(userData);
      res.status(HTTP_statusCode.OK).send("OTP sent to mail");
    } catch (error: any) {
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
    }
  };

  otpVerification = async (req: Request, res: Response) => {
    try {

      const enteredOtp: { enteredOtp: string } = req.body.enteredOtp;


      const serviceResponse = await this.userService.otpVerification(
        enteredOtp
      );
      res.status(HTTP_statusCode.OK).json(serviceResponse);
    } catch (error: any) {
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
  };

  resendOtp = async (req: Request, res: Response) => {
    try {
      await this.userService.resendOTP();
      res.status(HTTP_statusCode.OK).send("OTP sended");
    } catch (error: any) {
      console.log("User:= resend otp error", error);
      if (error.message === "Email not send") {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Email not send" });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({ message: "Something wrong please try again later" });
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
        maxAge: 15 * 60 * 1000,
      });

      res.json({ userData: serviceResponse.userData });


    } catch (error: any) {


      // console.log("User:= login error", error.message);
      if (error.message === "Email not found") {
        res.status(HTTP_statusCode.NotFound).json({ message: "Email not found" });
      } else if (error.message === "Wrong password") {
        res.status(HTTP_statusCode.Unauthorized).json({ message: "Wrong password" });
      } else if (error.message === "User is blocked") {
        res.status(HTTP_statusCode.NoAccess).json({ message: "User is blocked" });
      } else {
        res.status(HTTP_statusCode.InternalServerError).json({ message: "Something wrong please try again later" });
      };
    };


  }

  getVerifiedDoctors = async (req: Request, res: Response) => {
    try {
      const docData = await this.userService.getVerifiedDoctors()
      res.status(HTTP_statusCode.OK).json(docData)
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: "Something went wrong", error });
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://localhost:1234/success",
      cancel_url: "http://localhost:1234/paymentFailed",
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


}


export default userController;
