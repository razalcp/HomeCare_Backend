import { IUserModel } from "./userModelInterface";
import { IUser, IUserAuth } from "./userInterface";
import { IUserWallet } from "../../models/user/userWalletModel";

// export interface ICancelBookingResponse {
//     message: string;
//   }

export interface IUserRepository {
    register(userData: IUser): Promise<IUser>;
    findByEmail(email: string): Promise<IUserModel | null>;
    login(email: string): Promise<IUserAuth | null>
    getVerifiedDoctors(): Promise<IUserModel[] | null>
    saveBookingToDb(slotId: string, userId: string, doctorId: string): Promise<void>
    getUserBookings(userId: string): Promise<any[]>
    getWalletData(userId: string): Promise<IUserWallet>
    cancelBooking(bookingId: string): Promise<any>
    updateUser(userId: string, imgObject?: any): Promise<IUserModel | null | void>;
    getUser(email: string): Promise<IUserAuth | null>
    getBookedDoctor(userId: string): Promise<any>
    findMessage(receiverId: string, senderId: string): Promise<any>
    deleteMessage(messageId: string): Promise<any>
    saveMessages(messageData: string): Promise<any>
    saveWalletBookingToDb(slotId: string, userId: string, doctorId: string, doctorFees: number): Promise<string>

}

