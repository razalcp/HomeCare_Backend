import { IBookingDTO } from "../dtos/doctor.dto";
import { IBookingSummary, IBookingWithDetails } from "../interfaces/doctor/doctorInterface";

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
