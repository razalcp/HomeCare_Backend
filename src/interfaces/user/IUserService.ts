import { IUserAuth, IUser } from "./userInterface";
import { IUserModel } from "./userModelInterface";

export interface IUserService {
    getDoctorSlotsForBooking(doctorId: string): unknown;
    register(userData: IUser): Promise<void>;
    otpVerification(enteredOtp: { enteredOtp: string }): Promise<void>;
    resendOTP(): Promise<void>;
    login(
        email: string,
        password: string
    ): Promise<{
        userData: IUserAuth;
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
    ): Promise<any>;

    saveBookingToDb(
        slotId: string,
        userId: string,
        doctorId: string
    ): Promise<void>;

    getUserBookings(userId: string): Promise<any[]>;

    cancelBooking(bookingId: string): Promise<any>;

    getWalletData(
        userId: string,
        page: number,
        limit: number
    ): Promise<any>;

    updateUserProfile(userData: any, imgObject: any): Promise<IUserModel | null | void>;

    getUser(email: string): Promise<IUserAuth | null>;

    getBookedDoctors(userId: string): Promise<any>;

    getMessages(receiverId: string, senderId: string): Promise<any>;

    saveMessages(messageData: any): Promise<any>;

    deleteMessage(messageId: string): Promise<any>;

    saveWalletBookingToDb(
        slotId: string,
        userId: string,
        doctorId: string,
        doctorFees: number
    ): Promise<string>;

    submitReview(reviewData: any): Promise<any>;

    reviewDetails(doctorId: string): Promise<any>;
}
