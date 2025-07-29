import { IUserAuthDTO, IUserBookingDTO, IUserProfileDTO } from "../dtos/user.dto";
import { IUserResponseFull } from "../interfaces/user/userInterface";
import { IUserModel } from "../interfaces/user/userModelInterface";

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
