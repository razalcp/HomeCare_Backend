export interface IUserAuthDTO {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isUserBlocked: boolean;
  profileIMG: string;
  age: number;
  allergies: string[];
  bloodGroup: string;
  currentMedications: string[];
  gender: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBookingDTO {
  _id: string;
  doctorId: {
    name: string;
    profileImage: string;
    consultationFee: number;
    consultationType: string[];
    degree: string;
    departments: string[];
    knownLanguages: string[];
  };
  slotId: {
    date: string;
    startTime: string;
    endTime: string;
  };
  paymentStatus: "processing" | "paid" | "failed" | "refunded";
  bookingStatus: "processing" | "booked" | "cancelled";
  consultationStatus: "pending" | "completed";
  createdAt: string;
}


export interface IUserProfileDTO {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  dob?: Date | string;
  profileIMG?: string;
  walletBalance?: number;
  isUserBlocked?: boolean;
  age?: number;
  bloodGroup?: string;
  gender?: 'Male' | 'Female' | 'Other';
  allergies?: string[];
  currentMedications?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}


export interface UpdateSlotStatusDTO {
  success: boolean;
  message: string;
}
