import { IUser, IUserAuth } from "../interfaces/user/userInterface";
import { IUserRepository } from "../interfaces/user/IUserReprository";
import sendEmail from "../config/email_config";
import bcrypt from "bcrypt";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { createToken, createRefreshToken } from "../config/jwt_config";
import { IUserService } from "../interfaces/user/IUserService";


class UserService implements IUserService {

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

  getVerifiedDoctors = async (
    page: number,
    limit: number,
    search: string,
    sort: string,
    departments: string[],
    minFee: number,
    maxFee: number
  ) => {
    try {
      return await this.userReprository.getVerifiedDoctors(
        page,
        limit,
        search,
        sort,
        departments,
        minFee,
        maxFee
      );
    } catch (error) {
      throw error;
    }
  };


  saveBookingToDb = async (slotId: string, userId: string, doctorId: string) => {
    try {
      await this.userReprository.saveBookingToDb(slotId, userId, doctorId)
    } catch (error) {
      throw error
    }
  }

  getUserBookings = async (userId: string) => {
    try {
      return await this.userReprository.getUserBookings(userId)
    } catch (error) {
      throw error
    }
  }

  cancelBooking = async (bookingId: string) => {
    try {
      const cancelBookingData = await this.userReprository.cancelBooking(bookingId)
      return cancelBookingData

    } catch (error) {
      throw error
    }
  };


  getWalletData = async (userId: string, page: number, limit: number) => {
    try {
      return await this.userReprository.getWalletData(userId, page, limit);
    } catch (error) {
      throw error;
    }
  };




  updateUserProfile = async (userData: any, imgObject: any) => {
    try {
      // Hash password if it exists
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password as string, 10);
        userData.password = hashedPassword;
      }

      const updateUserData = await this.userReprository.updateUser(userData, imgObject);
      return updateUserData;
    } catch (error: any) {

      throw new Error(error.message);
    }
  };

  getUser = async (email: string) => {
    try {
      const getUserData = await this.userReprository.getUser(email)
      return getUserData
    } catch (error) {
      throw error
    }
  };

  getBookedDoctors = async (userId: string) => {
    try {
      const userData = await this.userReprository.getBookedDoctor(userId)
      return userData
    } catch (error) {
      return error
    };

  };

  getMessages = async (receiverId: string, senderId: string) => {
    try {
      const messageData = await this.userReprository.findMessage(receiverId, senderId)

      return messageData
    } catch (error) {
      return error
    }
  };

  saveMessages = async (messageData: any) => {
    try {

      const saveData = await this.userReprository.saveMessages(messageData)
      return saveData
    } catch (error) {
      return error
    }
  };
  deleteMessage = async (messageId: string) => {
    try {
      const updateData = await this.userReprository.deleteMessage(messageId)
      return updateData
    } catch (error) {
      return error
    }
  };

  saveWalletBookingToDb = async (slotId: string, userId: string, doctorId: string, doctorFees: number) => {
    try {
      return await this.userReprository.saveWalletBookingToDb(slotId, userId, doctorId, doctorFees)
    } catch (error) {
      throw error
    }
  };

  submitReview = async (reviewData: any) => {
    try {
      const saveData = await this.userReprository.submitReview(reviewData)
      return saveData
    } catch (error) {
      throw error
    }
  };


  reviewDetails = async (doctorId: string) => {
    try {
      const saveData = await this.userReprository.reviewDetails(doctorId)
      return saveData
    } catch (error) {
      throw error
    }
  };

  getDoctorSlotsForBooking = async (doctorId: string) => {
    const getSlots = await this.userReprository.getDoctorSlotsForBooking(doctorId)
    return getSlots
  };

  getPrescription = async (bookingId: string) => {
    try {
      const prescriptionData = await this.userReprository.getPrescription(bookingId)
      return prescriptionData
    } catch (error) {
      throw new Error('error in getting your prerscription' + error);
    }
  };
}

export default UserService;
