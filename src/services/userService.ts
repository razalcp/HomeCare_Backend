import { IUser, IUserAuth } from "../interfaces/user/userInterface";
import { IUserRepository } from "../interfaces/user/IUserReprository";
import sendEmail from "../config/email_config";
import bcrypt from "bcrypt";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { createToken, createRefreshToken } from "../config/jwt_config";

class UserService {
  private userReprository: IUserRepository;
  private userData: IUser | null = null;
  private OTP: string | null = null;
  private expiryOTP_time: Date | null = null;

  constructor(userReprository: IUserRepository) {
    this.userReprository = userReprository;
  }

  register = async (userData: IUser) => {
    try {
      const alreadyExistingUser: IUserModel | null =
        await this.userReprository.findByEmail(userData.email);

      if (alreadyExistingUser) {
        throw new Error("Email already exists");
      }

      this.userData = userData;
      const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString();

      this.OTP = generated_Otp;

      const isMailSended = await sendEmail(userData.email, generated_Otp);

      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
      return;
    } catch (error) {
      throw error;
    }
  };

  otpVerification = async (enteredOtp: { enteredOtp: string }) => {
    try {
      if (enteredOtp.enteredOtp !== this.OTP) {
        throw new Error("Incorrect OTP");
      }
      const currentTime = new Date();
      if (currentTime > this.expiryOTP_time!) {
        throw new Error("OTP expired");
      }

      const hashedPassword = await bcrypt.hash(
        this.userData!.password as string,
        10
      );

      this.userData!.password = hashedPassword;
      const response = this.userReprository.register(this.userData!);
    } catch (error) {
      throw error;
    }
  };

  resendOTP = async () => {
    try {
      const Generated_OTP: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this.OTP = Generated_OTP;
      console.log(`Re-generated OTP is : ${Generated_OTP}`);
      const isMailSended = await sendEmail(this.userData!.email, Generated_OTP);
      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this.expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
    } catch (error) {
      throw error;
    }
  };

  login = async (email: string, password: string): Promise<{ userData: IUserAuth; userToken: string; userRefreshToken: string; }> => {


    try {
      const userData = await this.userReprository.login(email);
   
      
      if (!userData) throw new Error("Email not found");

      const comparePassword = await bcrypt.compare(password, userData.password as string);
      if (!comparePassword) throw new Error("Wrong password");
      if (userData.isUserBlocked) throw new Error("User is blocked");
      const userToken = createToken(userData._id as string, process.env.userRole as string);
      const userRefreshToken = createRefreshToken(userData._id as string, process.env.userRole as string);

      return { userData, userToken, userRefreshToken }

    } catch (error) {
      throw error
    }
  };

  getVerifiedDoctors=async()=>{
    try {
      return await this.userReprository.getVerifiedDoctors()
    } catch (error) {
      throw error
    }
  }
}

export default UserService;
