import { IBookedDoctorForChat, ICancelBookingResponse, IMessageSaveResponse, IMessageUser, IReviewSubmit, ISaveMessageInput, IUpdateUserProfileImage, IUpdateUserProfileInput, IUser, IUserAuth, IVerifiedDoctorsResponse, IWalletData } from "../interfaces/user/userInterface";
import { IUserRepository } from "../interfaces/user/IUserReprository";
import sendEmail from "../config/email_config";
import bcrypt from "bcrypt";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { createToken, createRefreshToken } from "../config/jwt_config";
import { IUserService } from "../interfaces/user/IUserService";
import { mapBookedDoctorDTO, mapDeleteMessageDTO, mapDoctorSlotsToDTO, mapMessageDTO, mapPrescriptionDTO, mapReviewResponse, mapSaveMessageDTO, mapToUserBookingDTO, mapUserProfileDTO, mapUserToAuthDTO, mapUserToSafeDTO, mapVerifiedDoctorDTO, mapWalletDataDTO, toUpdateSlotStatusDTO } from "../mappers/user.mapper";
import { IUserAuthDTO, IUserBookingDTO, UpdateSlotStatusDTO } from "../dtos/user.dto";



class UserService implements IUserService {

  private _userReprository: IUserRepository;
  private _userData: IUser | null = null;
  private _OTP: string | null = null;
  private _expiryOTP_time: Date | null = null;

  constructor(userReprository: IUserRepository) {
    this._userReprository = userReprository;
  }

  register = async (userData: IUser) => {
    try {
      const alreadyExistingUser: IUserModel | null =
        await this._userReprository.findByEmail(userData.email);

      if (alreadyExistingUser) {
        throw new Error("Email already exists");
      }

      this._userData = userData;
      const generated_Otp = Math.floor(1000 + Math.random() * 9000).toString();

      this._OTP = generated_Otp;

      const isMailSended = await sendEmail(userData.email, generated_Otp);

      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
      return;
    } catch (error) {
      throw error;
    }
  };

  otpVerification = async (enteredOtp: { enteredOtp: string }) => {
    try {
      if (enteredOtp.enteredOtp !== this._OTP) {
        throw new Error("Incorrect OTP");
      }
      const currentTime = new Date();
      if (currentTime > this._expiryOTP_time!) {
        throw new Error("OTP expired");
      }

      const hashedPassword = await bcrypt.hash(
        this._userData!.password as string,
        10
      );

      this._userData!.password = hashedPassword;
      const response = await this._userReprository.register(this._userData!);
    } catch (error) {
      throw error;
    }
  };

  resendOTP = async () => {
    try {
      const Generated_OTP: string = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      this._OTP = Generated_OTP;
      console.log(`Re-generated OTP is : ${Generated_OTP}`);


      const isMailSended = await sendEmail(this._userData!.email, Generated_OTP);
      if (!isMailSended) {
        throw new Error("Email not send");
      }
      const OTP_createdTime = new Date();
      this._expiryOTP_time = new Date(OTP_createdTime.getTime() + 2 * 60 * 1000);
    } catch (error) {
      throw error;
    }
  };

  login = async (email: string, password: string): Promise<{ userData: IUserAuthDTO; userToken: string; userRefreshToken: string; }> => {
    try {
      const userData = await this._userReprository.login(email);
      if (!userData) throw new Error("Email not found");
      const comparePassword = await bcrypt.compare(password, userData.password as string);
      if (!comparePassword) throw new Error("Wrong password");
      if (userData.isUserBlocked) throw new Error("User is blocked");

      const userToken = createToken(userData._id as unknown as string, process.env.userRole as string);
      const userRefreshToken = createRefreshToken(userData._id as unknown as string, process.env.userRole as string);
      const safeUserData = mapUserToAuthDTO(userData);
      return { userData: safeUserData, userToken, userRefreshToken };

    } catch (error) {
      throw error
    }
  };

  // getVerifiedDoctors = async (
  //   page: number,
  //   limit: number,
  //   search: string,
  //   sort: string,
  //   departments: string[],
  //   minFee: number,
  //   maxFee: number
  // ): Promise<IVerifiedDoctorsResponse> => {
  //   try {   

  //     return await this._userReprository.getVerifiedDoctors(
  //       page,
  //       limit,
  //       search,
  //       sort,
  //       departments,
  //       minFee,
  //       maxFee
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  getVerifiedDoctors = async (
    page: number,
    limit: number,
    search: string,
    sort: string,
    departments: string[],
    minFee: number,
    maxFee: number
  ): Promise<IVerifiedDoctorsResponse> => {
    try {
      const result = await this._userReprository.getVerifiedDoctors(
        page,
        limit,
        search,
        sort,
        departments,
        minFee,
        maxFee
      );

      const mappedData = result.data.map(mapVerifiedDoctorDTO);

      return {
        data: mappedData,
        total: result.total,
      };
    } catch (error) {
      throw error;
    }
  };


  saveBookingToDb = async (slotId: string, userId: string, doctorId: string) => {
    try {
      await this._userReprository.saveBookingToDb(slotId, userId, doctorId)
    } catch (error) {
      throw error
    }
  }


  getUserBookings = async (userId: string): Promise<IUserBookingDTO[]> => {
    try {
      const rawBookings = await this._userReprository.getUserBookings(userId);

      const bookings: IUserBookingDTO[] = rawBookings.map(mapToUserBookingDTO);

      return bookings;
    } catch (error) {
      throw error;
    }
  };


  cancelBooking = async (bookingId: string): Promise<ICancelBookingResponse> => {
    try {
      const cancelBookingResponse = await this._userReprository.cancelBooking(bookingId)
      return cancelBookingResponse

    } catch (error) {
      throw error
    }
  };


  // getWalletData = async (userId: string, page: number, limit: number): Promise<IWalletData> => {
  //   try {   
  //     return await this._userReprository.getWalletData(userId, page, limit);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  getWalletData = async (userId: string, page: number, limit: number): Promise<IWalletData> => {
    try {
      const result = await this._userReprository.getWalletData(userId, page, limit);
      return mapWalletDataDTO(result);
    } catch (error) {
      throw error;
    }
  };


  // updateUserProfile = async (userData: IUpdateUserProfileInput, imgObject: IUpdateUserProfileImage) => {
  //   try {
  //     // Hash password if it exists
  //     if (userData.password) {
  //       const hashedPassword = await bcrypt.hash(userData.password as string, 10);
  //       userData.password = hashedPassword;
  //     }
  //     const updateUserData = await this._userReprository.updateUser(userData, imgObject);

  //     return updateUserData;
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(error.message);
  //     }
  //     throw new Error("An unexpected error occurred");
  //   }
  // };

  updateUserProfile = async (userData: IUpdateUserProfileInput, imgObject: IUpdateUserProfileImage): Promise<IUserModel | null> => {
    try {
      // Hash password if it exists
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password as string, 10);
        userData.password = hashedPassword;
      }

      const updateUserData = await this._userReprository.updateUser(userData, imgObject);
      return updateUserData ? mapUserProfileDTO(updateUserData) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  };

  getUser = async (email: string) => {
    try {
      const getUserData = await this._userReprository.getUser(email)
      if (!getUserData) return null;
      const userDTO = mapUserToSafeDTO(getUserData);
      return userDTO
    } catch (error) {
      throw error
    }
  };

  getBookedDoctors = async (userId: string): Promise<IBookedDoctorForChat[]> => {
    try {
      const userData = await this._userReprository.getBookedDoctor(userId)
      return userData.map(mapBookedDoctorDTO);
    } catch (error) {
      throw error
    };

  };

  getMessages = async (receiverId: string, senderId: string): Promise<IMessageUser[]> => {
    try {
      const messageData = await this._userReprository.findMessage(receiverId, senderId)
      return messageData.map(mapMessageDTO);
    } catch (error) {
      throw error
    }
  };

  saveMessages = async (messageData: ISaveMessageInput) => {
    try {
      const saveData = await this._userReprository.saveMessages(mapSaveMessageDTO(messageData));
      return saveData;
    } catch (error) {
      throw error
    }
  };

  deleteMessage = async (messageId: string): Promise<IMessageSaveResponse | null> => {
    try {
      const updateData = await this._userReprository.deleteMessage(messageId)
      return updateData ? mapDeleteMessageDTO(updateData) : null;
    } catch (error) {
      throw error
    }
  };

  saveWalletBookingToDb = async (slotId: string, userId: string, doctorId: string, doctorFees: number) => {
    try {
      return await this._userReprository.saveWalletBookingToDb(slotId, userId, doctorId, doctorFees)
    } catch (error) {
      throw error
    }
  };

  submitReview = async (reviewData: IReviewSubmit) => {
    try {
      const saveData = await this._userReprository.submitReview(reviewData)
      return mapReviewResponse(saveData);
    } catch (error) {
      throw error
    }
  };

  reviewDetails = async (doctorId: string) => {
    try {
      const saveData = await this._userReprository.reviewDetails(doctorId)
      return mapReviewResponse(saveData);
    } catch (error) {
      throw error
    }
  };

  getDoctorSlotsForBooking = async (doctorId: string) => {
    const getSlots = await this._userReprository.getDoctorSlotsForBooking(doctorId)
    return mapDoctorSlotsToDTO(getSlots)
  };


  getPrescription = async (bookingId: string) => {
    try {
      const prescriptionData = await this._userReprository.getPrescription(bookingId)
      if (!prescriptionData) {
        throw new Error('Prescription not found');
      }
      return mapPrescriptionDTO(prescriptionData);
    } catch (error) {
      throw new Error('error in getting your prerscription' + error);
    }
  };

  updateSlotStatus = async (slotId: string, doctorId: string): Promise<UpdateSlotStatusDTO> => {
    try {
      const updateData = await this._userReprository.updateSlotStatus(slotId, doctorId);
      return toUpdateSlotStatusDTO(updateData);
    } catch (error) {
      throw error;
    }
  };
  updatePaymentFail = async (slotId: string, doctorId: string) => {
    try {
      await this._userReprository.updatePaymentFail(slotId, doctorId)
    } catch (error) {
      throw error
    }
  }

};

export default UserService;
