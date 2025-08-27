import mongoose, { Document, Types } from "mongoose";
import { IBookingDTO, IDoctorDashboardDTO } from "../dtos/doctor.dto";
import { IBookedUser, IBookingSummary, IBookingWithDetails, IDoctorDashboard, IMessageFromDoctor, IWalletResponse } from "../interfaces/doctor/doctorInterface";
import IDoctorModel from "../interfaces/doctor/doctorModelInterface";
import { ISlot } from "../models/doctor/slotModel";


export const mapBookingToDTO = (booking: IBookingSummary): IBookingDTO => {

    return {
        userId: {
            _id: booking.userId._id,
            name: booking.userId.name,
        },
        slotId: {
            _id: booking.slotId._id,
            date: booking.slotId.date,
            startTime: booking.slotId.startTime,
            endTime: booking.slotId.endTime,
        },
        paymentStatus: booking.paymentStatus,
        consultationStatus: booking.consultationStatus,
        createdAt: booking.createdAt,
    };
};

export const mapDoctorEmailDTO = (doctor: { email?: string } | null): { email?: string } | null => {
    if (!doctor) return null;

    return {
        email: doctor.email
    };
};

export const mapDoctorFullDTO = (
    doctor: IDoctorModel
): IDoctorModel => {

    return {
        _id: doctor._id,
        email: doctor.email,
        slotId: doctor.slotId,
        departments: doctor.departments,
        knownLanguages: doctor.knownLanguages,
        consultationType: doctor.consultationType,
        isVerified: doctor.isVerified,
        kycStatus: doctor.kycStatus,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
        bio: doctor.bio,
        certifications0: doctor.certifications0,
        certifications1: doctor.certifications1,
        consultationFee: doctor.consultationFee,
        country: doctor.country,
        dateOfBirth: doctor.dateOfBirth,
        degree: doctor.degree,
        experience: doctor.experience,
        institution: doctor.institution,
        medicalLicenceNumber: doctor.medicalLicenceNumber,
        name: doctor.name,
        profileImage: doctor.profileImage,
        state: doctor.state,
        year: doctor.year
    }

};

export const mapDepartmentsDTO = (departments: { departmentName: string }[]) => {
    return departments.map(dept => ({
        departmentName: dept.departmentName
    }));
};


export const mapDoctorUpdateFullDTO = (
    doctor: void | IDoctorModel | null
): IDoctorModel => {

    return {
        _id: doctor?._id,
        email: doctor?.email || "email",
        slotId: doctor?.slotId,
        departments: doctor?.departments || [],
        knownLanguages: doctor?.knownLanguages,
        consultationType: doctor?.consultationType,
        isVerified: doctor?.isVerified || false,
        kycStatus: doctor?.kycStatus,
        createdAt: doctor?.createdAt,
        updatedAt: doctor?.updatedAt,
        bio: doctor?.bio,
        certifications0: doctor?.certifications0 || "cer0",
        certifications1: doctor?.certifications1 || "cer1",
        consultationFee: doctor?.consultationFee,
        country: doctor?.country || 'country',
        dateOfBirth: doctor?.dateOfBirth,
        degree: doctor?.degree,
        experience: doctor?.experience,
        institution: doctor?.institution,
        medicalLicenceNumber: doctor?.medicalLicenceNumber || "string",
        name: doctor?.name || "Viswas",
        profileImage: doctor?.profileImage || "profile_Image",
        state: doctor?.state || "Kerala",
        year: doctor?.year
    }

};


export const mapAddDoctorSlotsDTO = (data: { success: boolean; message: string }) => {
    return {
        success: data.success,
        message: data.message
    };
};

export const mapDoctorSlotsDTO = (data: { slots: ISlot[]; total: number }) => {
    return {
        slots: data.slots.map((slot: ISlot) => {
            const plainSlot = slot.toObject({ versionKey: false });
            return plainSlot;
        }),
        total: data.total
    };
};

export const mapWalletDataDTO = (
    data: { wallet: IWalletResponse; totalPages: number } | null
): { wallet: IWalletResponse | null; totalPages: number } | null => {
    if (!data) return null;

    return {
        wallet: data.wallet, // already plain object
        totalPages: data.totalPages ?? 0,
    };
};

export const mapBookedUsersDTO = (
    data: (IBookedUser | (IBookedUser & Document))[]
): IBookedUser[] => {
    return data.map((user) => {

        if ("toObject" in user && typeof user.toObject === "function") {
            return user.toObject({ versionKey: false }) as IBookedUser;
        }
        return user as IBookedUser;
    });
};


export const messageMapper = (data: IMessageFromDoctor): IMessageFromDoctor => {
    return {
        _id: data._id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        image: data.image,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
};

type MessageDocOrObj = IMessageFromDoctor | (IMessageFromDoctor & Document);

export const mapMessagesDTO = (data: MessageDocOrObj[]): IMessageFromDoctor[] => {
    return data.map((msg) => {

        const plainMsg: IMessageFromDoctor =
            "toObject" in msg
                ? msg.toObject<IMessageFromDoctor>({ versionKey: false })
                : msg;

        return {
            _id: plainMsg._id,
            senderId: plainMsg.senderId,
            receiverId: plainMsg.receiverId,
            message: plainMsg.message,
            image: plainMsg.image,
            createdAt: plainMsg.createdAt,
            updatedAt: plainMsg.updatedAt,
        };
    });
};


export const mapDoctorDashboardDTO = (data: IDoctorDashboard): IDoctorDashboardDTO => {
  return {
    totalAppointments: data.totalAppointments,
    activePatients: data.activePatients,
    upcomingAppointments: data.upcomingAppointments.map((appt) => ({
      _id: appt._id,
      doctorId: appt.doctorId,
      userId: appt.userId,
      slotId: appt.slotId, // keep structure as-is
      paymentStatus: appt.paymentStatus,
      bookingStatus: appt.bookingStatus,
      consultationStatus: appt.consultationStatus,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      
    })),
    doctorRevenue: data.doctorRevenue,
  };
};

