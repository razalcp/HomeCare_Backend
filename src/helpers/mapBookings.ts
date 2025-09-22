// src/utils/mapBookings.ts

import { Types } from "mongoose";
import { IUserBooking, IUserModel } from "../interfaces/user/userInterface";


import { ObjectId } from "mongodb";
import { ISlot } from "../models/doctor/slotModel";

export interface IBookingRawData {
  _id: Types.ObjectId;
  doctorId: {
    _id: Types.ObjectId;
    email: string;
    slotId: Types.ObjectId[];
    departments: string[];
    knownLanguages: string[];
    consultationType: string[];
    certifications: string[];
    isVerified: boolean;
    kycStatus: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
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
  };
  userId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    mobile: string;
    password: string;
    isUserBlocked: boolean;
    medicalRecords: [];
    __v: number;
    profileIMG: string;
    age: number;
    allergies: string[];
    bloodGroup: string;
    currentMedications: string[];
    gender: string;
    createdAt: Date;
    updatedAt: Date;
  };
  slotId: {
    _id: Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    doctorId: Types.ObjectId;
    isBooked: boolean;
    __v: number;
  };
  paymentStatus: string;
  bookingStatus: string;
  consultationStatus: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}


export const mapBookingsToUserResponse = (bookingsRaw: IBookingRawData[]): IUserBooking[] => {
  return bookingsRaw.map((b) => ({
    _id: b._id.toString(),
    doctorId: b.doctorId as unknown as IUserBooking["doctorId"],

    userId: (b.userId as unknown as IUserModel),

    slotId: (b.slotId as unknown as ISlot),
    paymentStatus: b.paymentStatus,
    bookingStatus: b.bookingStatus,
    consultationStatus: b.consultationStatus,
    createdAt: b.createdAt ?? new Date(),
    updatedAt: b.updatedAt ?? new Date(),


  }));
};
