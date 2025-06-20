
import IDoctorModel from "./doctorModelInterface";
import { ISlot } from "../../models/doctor/slotModel";
import { IBooking } from "../../models/user/bookingModel";
import { IDepartment } from "../../models/admin/departmentModel";
import { IWallet } from "../../models/doctor/doctorWalletModel";

export interface IDoctorService {
  [x: string]: any
  findRegisteredEmail(email: string): Promise<IDoctorModel | null>;
  register(email: string): Promise<void>;
  doctorLogin(email: string): Promise<void>;

  otpVerification(enteredOtp: string): Promise<{
    doctorData: IDoctorModel;
    doctorToken: string;
    doctorRefreshToken: string;
  }>;

  verifyDoctorOtp(enteredOtp: string): Promise<{
    doctorData: IDoctorModel;
    doctorToken: string;
    doctorRefreshToken: string;
  }>;

  resendOTP(): Promise<void>;

  doctorKycRegister(
    doctorData: any,
    imgObject: any
  ): Promise<void | IDoctorModel | null>;

  getDepartments(): Promise<Pick<IDepartment, "departmentName">[]>;

  updateDoctorProfile(
    doctorData: any,
    imgObject: any
  ): Promise<void | IDoctorModel | null>;

  addDoctorSlots(slotData: any): Promise<{
    success: boolean;
    message: string;
  }>;

  getDoctorSlotsForBooking(doctorId: string): Promise<ISlot[]>;

  getDoctorSlots(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<{
    slots: ISlot[];
    total: number;
  }>;

  getMyBookings(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<{
    bookings: IBooking[];
    totalPages: number;
  }>;

  getWalletData(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<{
    wallet: IWallet & { transactions: any[] };
    totalPages: number;
  }>;

  deleteSlot(slotId: string): Promise<any>;

  getBookedUsers(doctorId: string): Promise<any[]>;

  saveMessages(messageData: any): Promise<any>;

  getMessages(
    receiverId: string,
    senderId: string
  ): Promise<any[]>;

  savePrescription(presData: any): Promise<void | Error>;

  getPrescription(bookingId: string): Promise<any>;

  doctorDashBoard(doctorId: string): Promise<{
    totalAppointments: number;
    activePatients: number;
    upcomingAppointments: number;
    doctorRevenue: number;
  }>;
}
