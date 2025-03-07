import UserService from "../../services/userService";
import { Request, Response } from "express";
import { IUser } from "../../interfaces/user/userInterface";
import HTTP_statusCode from "../../enums/httpStatusCode";

class userController {
  private userService: UserService;

  constructor(userService: UserService) {
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


      console.log("User:= login error", error.message);
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


}


export default userController;
