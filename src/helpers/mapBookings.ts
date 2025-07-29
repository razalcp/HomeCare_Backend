// src/utils/mapBookings.ts

import { IUserBooking } from "../interfaces/user/userInterface";

export const mapBookingsToUserResponse = (bookingsRaw: any[]): IUserBooking[] => {
  return bookingsRaw.map((b) => ({
    _id: b._id.toString(),
    doctorId: b.doctorId ,
    userId: b.userId ,
    slotId: b.slotId ,
    paymentStatus: b.paymentStatus,
    bookingStatus: b.bookingStatus,
    consultationStatus: b.consultationStatus,
    createdAt: b.createdAt?.toISOString() ?? '',
    updatedAt: b.updatedAt?.toISOString() ?? '',
    __v: b.__v,
  }));
};
