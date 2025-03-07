import { IUserRepository } from "../interfaces/user/IUserReprository";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { Model } from "mongoose";
import { IUser, IUserAuth } from "../interfaces/user/userInterface";
import { IDoctor } from "../models/doctor/doctorModel";
class UserReprository implements IUserRepository {
  private userModel = Model<IUserModel>;
  private doctorModel = Model<IDoctor>

  constructor(userModel: Model<IUserModel>, doctorModel: Model<IDoctor>) {
    this.userModel = userModel;
    this.doctorModel = doctorModel
  }

  findByEmail = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  };

  register = async (userData: IUser): Promise<IUser> => {
    try {
      return await this.userModel.create(userData);
    } catch (error) {
      throw error;
    }
  };

  login = async (email: string): Promise<IUser | null> => {
    try {
      const singleUser = await this.userModel.findOne({ email })

      if (singleUser.isUserBlocked === false) {

        return singleUser;
      } else {
        console.log("blocked");

        throw new Error("User is blocked")
      }

    } catch (error) {
      throw error
    }
  }

  getVerifiedDoctors = async () => {
    try {
      const data = await this.doctorModel.find({ kycStatus: "Approved" })
      console.log("rep", data);
      return data

    } catch (error) {
      throw error
    }
  }
}

export default UserReprository;
