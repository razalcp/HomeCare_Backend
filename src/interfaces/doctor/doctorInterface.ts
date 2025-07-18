import { IMedication } from "../../models/doctor/prescriptionModel";
import { ISlot } from "../../models/doctor/slotModel";

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



