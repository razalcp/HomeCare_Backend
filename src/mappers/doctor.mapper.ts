import { IBookingDTO } from "../dtos/doctor.dto";
import { IBookingSummary, IBookingWithDetails } from "../interfaces/doctor/doctorInterface";
import IDoctorModel from "../interfaces/doctor/doctorModelInterface";
import { IDoctor } from "../models/doctor/doctorModel";

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
        doctorName: doctor.doctorName,
        departments: doctor.departments,
        doctorImage: doctor.doctorImage,
        mobileNumber: doctor.mobileNumber,
        email: doctor.email,
        doctorAddress: doctor.doctorAddress,
        slotId: doctor.slotId,
        dob: doctor.dob,
        experienceYears: doctor.experienceYears,
        bio: doctor.bio,
        doctorEducationId: doctor.doctorEducationId,
        knownLanguages: doctor.knownLanguages,
        medicalLicenceNumber: doctor.medicalLicenceNumber,
        typesOfConsultation: doctor.typesOfConsultation,
        consultationFee: doctor.consultationFee,
        certification: doctor.certification,
        doctorTransactionsId: doctor.doctorTransactionsId,
        doctorWalletBalance: doctor.doctorWalletBalance,
        isBlocked: doctor.isBlocked,
        isVerified: doctor.isVerified,
        isSubmitted: doctor.isSubmitted,
        kycStatus: doctor.kycStatus,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
    };
};
