

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
