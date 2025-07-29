import { IUserModel } from "./userModelInterface";
import { IBookedDoctorForChat, IDoctorSlot, IMessageSaveResponse, IMessageUser, IReviewResponse, IReviewSubmit, ISaveMessageInput, IUpdateUserProfileImage, IUpdateUserProfileInput, IUser, IUserAuth, IUserBooking, IUserResponseFull, IVerifiedDoctorsResponse, IWalletData } from "./userInterface";
import {IPrescriptionResponse } from "../doctor/doctorInterface";


export interface IUserRepository {
    register(userData: IUser): Promise<IUserModel>;
    findByEmail(email: string): Promise<IUserModel | null>;
    login(email: string): Promise<IUserModel | null>
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
    getUserBookings(userId: string): Promise<IUserBooking[]>
    getWalletData(
        userId: string,
        page: number,
        limit: number
    ): Promise<IWalletData>;
    cancelBooking(bookingId: string): Promise<{ message: string }>;
    updateUser(userData: IUpdateUserProfileInput, imgObject?: IUpdateUserProfileImage): Promise<IUserModel | null | void>;
    getUser(email: string): Promise<IUserResponseFull | null>;
    getBookedDoctor(userId: string): Promise<IBookedDoctorForChat[]>;
    findMessage(receiverId: string, senderId: string): Promise<IMessageUser[]>;
    deleteMessage(messageId: string): Promise<IMessageSaveResponse | null>;
    saveMessages(messageData: ISaveMessageInput): Promise<IMessageSaveResponse>;
    saveWalletBookingToDb(slotId: string, userId: string, doctorId: string, doctorFees: number): Promise<string>
    reviewDetails(doctorId: string): Promise<IReviewResponse>;
    submitReview(reviewData: IReviewSubmit): Promise<IReviewResponse>
    getPrescription(bookingId: string): Promise<IPrescriptionResponse | null>;
    getDoctorSlotsForBooking(doctorId: string): Promise<IDoctorSlot[]>;

}

