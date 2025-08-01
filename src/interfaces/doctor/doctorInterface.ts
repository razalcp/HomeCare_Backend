import { Types } from "mongoose";
import { IMedication } from "../../models/doctor/prescriptionModel";
import { ISlot } from "../../models/doctor/slotModel";
import { IUserModel } from "../user/userModelInterface";
import IDoctorModel from "./doctorModelInterface";
import { Request } from 'express';

export interface IDoctorKycRegisterInput {
    name: string;
    email: string;
    state: string;
    country: string;
    departments: string[];
    experience: string;
    dateOfBirth: string;
    bio: string;
    knownLanguages: string[];
    degree: string;
    institution: string;
    year: string;
    medicalLicenceNumber: string;
    consultationType: string[];
    consultationFee: string;
}

export interface IDoctorImageUpload {
    certifications0?: string;
    certifications1?: string;
    profileImage?: string;
}



export type SlotInput = ISlot | ISlot[];

export interface IWalletTransaction {
    _id: Types.ObjectId;
    amount: number;
    transactionId: string;
    transactionType: "credit" | "debit";
    appointmentId?: string;
    date?: Date;
}


interface IBookedDoctorSlot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: "Booked" | "Available" | "Cancelled";
}

export interface IBookedUser {
    bookingId: string;
    _id: Types.ObjectId;
    name: string;
    email: string;
    mobile: string;
    profileIMG: string;
    bloodGroup: string;
    age: number;
    gender: string;
    consultationStatus: "pending" | "completed" | "cancelled"; // Add more statuses if needed
    slotId: IBookedDoctorSlot;
};

export interface IMessageFromDoctor {
    _id: Types.ObjectId;
    senderId: string;
    receiverId: string;
    message: string;
    image: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPrescriptionRequest {
    bookingId: string;
    patientAdvice: string;
    medications: IMedication[];
    userId: string;
    doctorId: string;
}

export interface IPrescriptionResponse {
    _id: string;
    bookingId: string;
    patientAdvice: string;
    medications: IMedication[];
    userId: string;
    doctorId: string;
    createdAt: string;
    updatedAt: string;
}


export interface IBooking {
    _id: string;
    doctorId: IDoctorModel;
    userId: IUserModel;
    slotId: ISlot;
    paymentStatus: string;
    bookingStatus: string;
    consultationStatus: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

// export interface IBookingLean {
//     doctorId: Types.ObjectId;
//     userId: Types.ObjectId;
//     slotId: Types.ObjectId;
//     paymentStatus: "processing" | "paid" | "failed" | "refunded";
//     bookingStatus: "processing" | "booked" | "cancelled";
//     consultationStatus: "pending" | "completed";
//     createdAt: Date;
//     updatedAt: Date;
// }

// export interface IGetMyBookingsResponse {
//     bookings: IBookingLean[];
//     totalPages: number;
// }

export interface IBookingSummary {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  slotId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  paymentStatus: "processing" | "paid" | "failed" | "refunded";
  consultationStatus: "pending" | "completed";
  createdAt: Date;
}


export interface IGetMyBookingsResponse {
    bookings: IBookingSummary[];
    totalPages: number;
}

export interface ILeanPopulatedBooking {
  _id: string | Types.ObjectId;
  userId: {
    _id: string | Types.ObjectId;
    name: string;
  };
  slotId: {
    _id: string | Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
  };
  paymentStatus: "processing" | "paid" | "failed" | "refunded";
  consultationStatus: "pending" | "completed";
  createdAt: Date;
}



export interface IWalletResponse {
    _id: Types.ObjectId;
    doctorId: string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

export type PopulatedBookingDashBoard = IBooking & { slotId: ISlot };


export interface IUpcomingAppointment {
    _id: Types.ObjectId;
    doctorId: Types.ObjectId;
    userId: Types.ObjectId;
    slotId: ISlot;
    paymentStatus: 'paid' | 'refunded';
    bookingStatus: 'booked' | 'cancelled';
    consultationStatus: 'completed' | 'pending';
    createdAt?: Date | string;
    updatedAt?: Date | string;
    __v?: number;
}

export interface IDoctorDashboard {
    totalAppointments: number;
    activePatients: number;
    upcomingAppointments: IUpcomingAppointment[];
    doctorRevenue: number;
}

export type PopulatedBooking = IBooking & {
    userId: IUserModel;
    slotId: ISlot;
};

export interface IMessage {
    _id?: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    message?: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface IUserBooked {
    _id: Types.ObjectId;
    name: string;
    email: string;
    mobile: string;
    profileIMG?: string;
    bloodGroup?: string;
    age?: number;
    gender?: string;
}

export interface IBookedSlot {
    _id: Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface IBookingWithPopulatedFields {
    _id: Types.ObjectId;
    userId: IUserBooked;
    slotId: IBookedSlot;
    consultationStatus: "pending" | "completed" | "cancelled";
    bookingStatus:"booked" | "cancelled"
}

export type DoctorImageObject = {
    profileImage?: string;
};

export interface AuthenticatedRequest extends Request {
    user: {
        user_id: string;
    };
}


export interface IBookingWithDetails {
    _id: Types.ObjectId;
    userId: {
        _id: string;
        name: string;
        createdAt: string;
    };
    slotId: {
        _id: string;
        date: string;
        startTime: string;
        endTime: string;
        status: string;
        isBooked: boolean;
    };
    paymentStatus: "processing" | "paid" | "failed" | "refunded";
    bookingStatus: "processing" | "booked" | "cancelled";
    consultationStatus: "pending" | "completed";
    createdAt: string;
    updatedAt: string;
}

