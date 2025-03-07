import { IUserModel } from "./userModelInterface";
import { IUser, IUserAuth } from "./userInterface";


export interface IUserRepository {
    register(userData: IUser): Promise<IUser>;
    findByEmail(email: string): Promise<IUserModel | null>;
    login(email: string): Promise<IUserAuth | null>
    getVerifiedDoctors(): Promise<IUserModel | null>

}

