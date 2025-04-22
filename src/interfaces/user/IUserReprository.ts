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
    getUserBookings(userId:string): Promise<any[]>
    getWalletData(userId:string):Promise<IUserWallet>
    updateUser(userId: string, imgObject?: any): Promise<IUserModel | null | void>; 
    getUser(email: string): Promise<IUserAuth | null>


}

