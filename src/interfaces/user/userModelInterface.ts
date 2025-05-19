import mongoose from "mongoose";
import { IMedicalRecords } from "./userInterface";

// export interface IUserModel {
//   _id?: mongoose.Types.ObjectId;
//   name: string;
//   email: string;
//   mobile: string;
//   password?: string;
//   dob?: Date;
//   profileIMG?: string;
//   walletBalance?: number;
//   medicalRecords?: IMedicalRecords[];
//   isUserBlocked?: boolean;
// }


export interface IUserModel {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  dob?: Date;
  profileIMG?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  bloodGroup?: string;
  allergies?: string[];
  currentMedications?: string[];
  walletBalance?: number;
  medicalRecords?: IMedicalRecords[];
  isUserBlocked?: boolean;
}