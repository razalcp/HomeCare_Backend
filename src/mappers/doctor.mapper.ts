import { IBookingDTO } from "../dtos/doctor.dto";


export const mapBookingToDTO = (booking: any): IBookingDTO => {
    return {
        userId: {
            _id: booking.userId._id,
            name: booking.userId.name,
            createdAt: booking.userId.createdAt,
        },
        slotId: {
            _id: booking.slotId._id,
            date: booking.slotId.date,
            startTime: booking.slotId.startTime,
            endTime: booking.slotId.endTime,
            status: booking.slotId.status,
            isBooked: booking.slotId.isBooked,
        },
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        consultationStatus: booking.consultationStatus,
        createdAt: booking.createdAt,
    };
};
