import { Types } from "mongoose";
import { IMedication } from "../../models/doctor/prescriptionModel";
import { ISlot } from "../../models/doctor/slotModel";
import { IUserModel } from "../user/userModelInterface";
import IDoctorModel from "./doctorModelInterface";

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
    profileImage: string;
}



export type SlotInput = ISlot | ISlot[];

export interface IWalletTransaction {
    _id: string;
    amount: number;
    transactionId: string;
    transactionType: "credit" | "debit";
    appointmentId: string;
    date: string; // ISO date string
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
    _id: string;
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
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    image: string | null;
    createdAt: string;
    updatedAt: string;
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

export interface IGetMyBookingsResponse {
    bookings: IBooking[];
    totalPages: number;
}

export interface IWalletResponse {
    _id: string;
    doctorId: string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}


export interface IUpcomingAppointment {
    _id: Types.ObjectId;
    doctorId: Types.ObjectId;
    userId: Types.ObjectId;
    slotId: ISlot;
    paymentStatus: 'paid' | 'refunded';
    bookingStatus: 'booked' | 'cancelled';
    consultationStatus: 'completed' | 'pending';
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface IDoctorDashboard {
    totalAppointments: number;
    activePatients: number;
    upcomingAppointments: IUpcomingAppointment[];
    doctorRevenue: number;
}
