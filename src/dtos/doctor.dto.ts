import mongoose from "mongoose";


export interface IUserDTO {
    _id: string;
    name: string;
    createdAt?: string;
}

export interface ISlotDTO {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    status?: string;
    isBooked?: boolean;
}

export interface IBookingDTO {
    userId: IUserDTO;
    slotId: ISlotDTO;
    paymentStatus: string;
    bookingStatus?: string;
    consultationStatus: string;
    createdAt: Date;
}

export interface IBookingListResponseDTO {
    bookings: IBookingDTO[];
    totalPages: number;
}

export interface DoctorSlotDTO {
    _id: mongoose.Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    doctorId: mongoose.Types.ObjectId;
    isBooked: boolean;
}


export interface IDoctorDashboardDTO {
    totalAppointments: number;
    activePatients: number;
    upcomingAppointments: IUpcomingAppointmentDTO[];
    doctorRevenue: number;
}

export interface IUpcomingAppointmentDTO {
    _id: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    slotId: unknown;
    paymentStatus: "paid" | "refunded";
    bookingStatus: "booked" | "cancelled";
    consultationStatus: "completed" | "pending";
    createdAt?: Date | string;
    updatedAt?: Date | string;
}