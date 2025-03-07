import mongoose from "mongoose";
import { IMedicalRecords } from "./userInterface";

export interface IUserModel {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  dob?: Date;
  profileIMG?: string;
  walletBalance?: number;
  medicalRecords?: IMedicalRecords[];
  isUserBlocked?: boolean;
}
