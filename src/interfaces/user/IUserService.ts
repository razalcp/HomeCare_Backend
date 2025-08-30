import { IUserAuthDTO, IUserBookingDTO, UpdateSlotStatusDTO } from "../../dtos/user.dto";
import { IPrescriptionResponse } from "../doctor/doctorInterface";
import { IUserAuth, IUser, IVerifiedDoctorsResponse, ICancelBookingResponse, IWalletData, IBookedDoctorForChat, IMessageUser, IMessageSaveResponse, ISaveMessageInput, IReviewResponse, IReviewSubmit, IDoctorSlot, IUpdateUserProfileInput, IUpdateUserProfileImage } from "./userInterface";
import { IUserModel } from "./userModelInterface";


export interface IUserService {
    getDoctorSlotsForBooking(doctorId: string): Promise<IDoctorSlot[]>;
    register(userData: IUser): Promise<void>;
    otpVerification(enteredOtp: { enteredOtp: string }): Promise<void>;
    resendOTP(): Promise<void>;
    login(
        email: string,
        password: string
    ): Promise<{
        userData: IUserAuthDTO;
        userToken: string;
        userRefreshToken: string;
    }>;

    getVerifiedDoctors(
        page: number,
        limit: number,
        search: string,
        sort: string,
        departments: string[],
        minFee: number,
        maxFee: number
    ): Promise<IVerifiedDoctorsResponse>;

    saveBookingToDb(
        slotId: string,
        userId: string,
        doctorId: string
    ): Promise<void>;

    getUserBookings(userId: string): Promise<IUserBookingDTO[]>;

    cancelBooking(bookingId: string): Promise<ICancelBookingResponse>;

    getWalletData(
        userId: string,
        page: number,
        limit: number
    ): Promise<IWalletData>;

    updateUserProfile(userData: IUpdateUserProfileInput, imgObject: IUpdateUserProfileImage): Promise<IUserModel | null | void>;

    getUser(email: string): Promise<IUserAuth | null>;

    getBookedDoctors(userId: string): Promise<IBookedDoctorForChat[]>;

    getMessages(receiverId: string, senderId: string): Promise<IMessageUser[]>;

    saveMessages(messageData: ISaveMessageInput): Promise<IMessageSaveResponse>;

    deleteMessage(messageId: string): Promise<IMessageSaveResponse | null>;

    saveWalletBookingToDb(
        slotId: string,
        userId: string,
        doctorId: string,
        doctorFees: number
    ): Promise<string>;

    submitReview(reviewData: IReviewSubmit): Promise<IReviewResponse>;
    reviewDetails(doctorId: string): Promise<IReviewResponse>;
    getPrescription(bookingId: string): Promise<IPrescriptionResponse>;
    updateSlotStatus(slotId: string, doctorId: string): Promise<UpdateSlotStatusDTO>
    updatePaymentFail(slotId: string, doctorId: string): Promise<void>

}
