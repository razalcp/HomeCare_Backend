import { IUserAuthDTO, IUserBookingDTO, IUserProfileDTO, UpdateSlotStatusDTO } from "../dtos/user.dto";
import { IPrescriptionResponse } from "../interfaces/doctor/doctorInterface";
import { IBookedDoctorForChat, IDoctorSlot, IMessageSaveResponse, IMessageUser, IReview, IReviewResponse, ISaveMessageInput, ISlotStatusUpdate, IUserResponseFull, IVerifiedDoctorData, IWalletData, IWalletTransaction } from "../interfaces/user/userInterface";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { IMedication } from "../models/doctor/prescriptionModel";

export const mapUserToAuthDTO = (user: IUserModel): IUserAuthDTO => ({
    _id: user._id?.toString() || '',
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    isUserBlocked: user.isUserBlocked ?? false,
    profileIMG: user.profileIMG ?? '',
    age: user.age ?? 0,
    allergies: user.allergies ?? [],
    bloodGroup: user.bloodGroup ?? '',
    currentMedications: user.currentMedications ?? [],
    gender: user.gender ?? 'Other',
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
});


export const mapToUserBookingDTO = (booking: any): IUserBookingDTO => {
    return {
        _id: booking._id.toString(),
        doctorId: {
            name: booking.doctorId.name,
            profileImage: booking.doctorId.profileImage,
            consultationFee: booking.doctorId.consultationFee,
            consultationType: booking.doctorId.consultationType,
            degree: booking.doctorId.degree,
            departments: booking.doctorId.departments,
            knownLanguages: booking.doctorId.knownLanguages,
        },
        slotId: {
            date: booking.slotId.date,
            startTime: booking.slotId.startTime,
            endTime: booking.slotId.endTime,
        },
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        consultationStatus: booking.consultationStatus,
        createdAt: booking.createdAt,
    };
};


export const mapUserToSafeDTO = (user: IUserResponseFull): IUserProfileDTO => {
    return {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        profileIMG: user.profileIMG,
        walletBalance: user.walletBalance,
        isUserBlocked: user.isUserBlocked,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        age: user.age,
        allergies: user.allergies,
        currentMedications: user.currentMedications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};


export const mapVerifiedDoctorDTO = (doctor: IVerifiedDoctorData): IVerifiedDoctorData => {
    return {
        _id: doctor._id,
        email: doctor.email,
        slotId: doctor.slotId,
        departments: doctor.departments,
        knownLanguages: doctor.knownLanguages,
        consultationType: doctor.consultationType,
        certifications: doctor.certifications,
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
        year: doctor.year,
    };
};


const mapWalletTransactionDTO = (tx: IWalletTransaction): IWalletTransaction => ({
    _id: tx._id,
    amount: tx.amount,
    transactionId: tx.transactionId,
    transactionType: tx.transactionType,
    appointmentId: tx.appointmentId,
    date: tx.date,
});

// Mapper for wallet data
export const mapWalletDataDTO = (wallet: IWalletData): IWalletData => ({
    _id: wallet._id,
    userId: wallet.userId,
    balance: wallet.balance,
    transactions: wallet.transactions.map(mapWalletTransactionDTO),
    totalTransactions: wallet.totalTransactions,
    currentPage: wallet.currentPage,
    totalPages: wallet.totalPages,
});

export const mapUserProfileDTO = (user: IUserModel): IUserModel => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    password: user.password,
    dob: user.dob ?? "dob not provided",
    profileIMG: user.profileIMG,
    gender: user.gender,
    age: user.age,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
    currentMedications: user.currentMedications,
    walletBalance: user.walletBalance,
    medicalRecords: user.medicalRecords,
    isUserBlocked: user.isUserBlocked,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});


export const mapBookedDoctorDTO = (doctor: IBookedDoctorForChat): IBookedDoctorForChat => ({
    _id: doctor._id,
    email: doctor.email,
    name: doctor.name,
    profileImage: doctor.profileImage,
});

export const mapMessageDTO = (msg: IMessageUser): IMessageUser => ({
    _id: msg._id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    message: msg.message,
    image: msg.image,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
});


export const mapSaveMessageDTO = (msg: ISaveMessageInput): ISaveMessageInput => ({
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    message: msg.message,
    image: msg.image
});

export const mapDeleteMessageDTO = (msg: IMessageSaveResponse): IMessageSaveResponse => ({
    _id: msg._id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    message: msg.message,
    image: msg.image,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
});

export const mapReviewResponse = (raw: IReviewResponse): IReviewResponse => {
    return {
        success: raw.success,
        message: raw.message,
        data: raw.data.map((review: IReview): IReview => ({
            _id: review._id,
            doctorId: review.doctorId,
            userId: {
                _id: review.userId?._id || "",
                name: review.userId?.name || "Name not available",
                profileIMG: review.userId?.profileIMG || "Profile image not available",
            },
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        })),
    };
};

const mapDoctorSlotToDTO = (slot: IDoctorSlot): IDoctorSlot => {
    return {
        _id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        doctorId: slot.doctorId,
        isBooked: slot.isBooked,
    };
};

export const mapDoctorSlotsToDTO = (slots: IDoctorSlot[]): IDoctorSlot[] => {
    return slots.map(mapDoctorSlotToDTO);
};


const mapMedicationDTO = (m: IMedication): IMedication => ({
    name: m.name,
    dosage: m.dosage,
    count: m.count,
    instruction: m.instruction,
});

export const mapPrescriptionDTO = (p: IPrescriptionResponse): IPrescriptionResponse => ({
    _id: p._id,
    bookingId: p.bookingId,
    patientAdvice: p.patientAdvice,
    medications: p.medications.map(mapMedicationDTO),
    userId: p.userId,
    doctorId: p.doctorId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
});

export const toUpdateSlotStatusDTO = (data:  ISlotStatusUpdate ): UpdateSlotStatusDTO => {
  return {
    success: data.success,
    message: data.message,
  };
};