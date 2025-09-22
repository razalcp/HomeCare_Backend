import { Document, Types } from "mongoose";
import IDoctorModel from "../doctor/doctorModelInterface";
import { ISlot } from "../../models/doctor/slotModel";

export interface IUser {

  name: string,
  email: string,
  mobile: string,
  password: string,
  confirmPassword?: string,
  isUserBlocked: boolean
}

export interface IUserModel extends IUser, Document {
  allergies: string[];
  currentMedications: string[];
  medicalRecords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAuth {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  dob?: Date | string;
  profileIMG?: string;
  walletBalance?: number;
  medicalRecords?: IMedicalRecords[];
  isUserBlocked?: boolean;
}

export interface IMedicalRecords {
  fileName: String,
  fileUrl: String,
  uploadDate: Date
}

export type DoctorImageObject = {
  certifications0?: string;
  certifications1?: string;
  profileImage?: string;
};

export interface IUpdateDoctorProfile {
  email: string;
  dateOfBirth: string; // ISO format like '1988-08-08'
  experience: string;
  bio: string;
}

export interface IVerifiedDoctorData {
  _id: string;
  email: string;
  slotId: string[];
  departments: string[];
  knownLanguages: string[];
  consultationType: string[];
  certifications: string[];
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  bio: string;
  certifications0?: string;
  certifications1?: string;
  consultationFee: number;
  country: string;
  dateOfBirth: string;
  degree: string;
  experience: string;
  institution: string;
  medicalLicenceNumber: string;
  name: string;
  profileImage: string;
  state: string;
  year: string;
}

export interface IVerifiedDoctorsResponse {
  data: IVerifiedDoctorData[];
  total: number;
}

export interface ICancelBookingResponse {
  message: string;
}

export interface IWalletTransaction {

  amount: number;
  transactionId: string;
  transactionType: "credit" | "debit";
  appointmentId: string;
  date: Date;
  _id: string;
}

export interface IWalletData {
  _id: string;
  userId: string;
  balance: number;
  transactions: IWalletTransaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
}

export interface IUpdateUserProfileInput {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: string | number;
  bloodGroup?: string;
  allergies?: string[];
  currentMedications?: string[];
}

export interface IUpdateUserProfileImage {
  profileImage?: string;
}

export interface TransformedImageObject extends Omit<IUpdateUserProfileImage, 'profileImage'> {
  profileIMG?: string;
}

export interface IBookedDoctorForChat {
  _id: string;
  email: string;
  name: string;
  profileImage: string;
}

export interface IMessageUser {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  image?: string
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageSaveResponse {
  _id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISaveMessageInput {
  senderId: string;
  receiverId: string;
  message: string;
  image: string | null;
}

export interface IReviewSubmit {
  doctorId: string;
  userId: string;
  rating: number;
  comment: string;
}

export interface IReview {
  _id?: string;
  doctorId: string;
  userId: {
    _id?: string;
    name?: string;
    profileIMG?: string
  };
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewResponse {
  success: boolean;
  message: string;
  data: IReview[];
}



export interface IDoctorSlot {
  _id: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Booked" | "Cancelled"; // adjust if there are more statuses
  doctorId: Types.ObjectId;
  isBooked: boolean;

}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isUserBlocked: boolean;
  profileIMG: string;
  walletBalance?: number;
  dob?: Date;
  age: number;
  allergies: string[];
  bloodGroup: string;
  currentMedications: string[];
  gender: 'Male' | 'Female' | 'Other';
  createdAt: Date;
  updatedAt: Date;
}
export interface IUserResponseFull {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  isUserBlocked?: boolean;
  profileIMG?: string;
  walletBalance?: number;
  dob?: Date | string;
  age?: number;
  allergies?: string[];
  bloodGroup?: string;
  currentMedications?: string[];
  gender?: 'Male' | 'Female' | 'Other';
  medicalRecords?: IMedicalRecords[];
  createdAt?: Date;
  updatedAt?: Date;
}




export interface ISlotBooking {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  userId: Types.ObjectId;
  slotId: Types.ObjectId;
  paymentStatus: "processing" | "paid" | "failed" | "refunded";
  bookingStatus: "processing" | "booked" | "cancelled";
  consultationStatus: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}


export interface IUserBooking {
  _id: string;
  doctorId: IDoctorModel;
  userId: IUserModel;
  slotId: ISlot;
  paymentStatus: string;
  bookingStatus: string;
  consultationStatus: string;
  createdAt: Date;
  updatedAt: Date;
  
}

export interface ISlotStatusUpdate {
  success: boolean;
  message: string;
}