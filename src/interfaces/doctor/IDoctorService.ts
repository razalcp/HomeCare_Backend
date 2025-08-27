
import IDoctorModel from "./doctorModelInterface";
import { ISlot } from "../../models/doctor/slotModel";
import { IDepartment } from "../../models/admin/departmentModel";
import { IBookedUser, IDoctorDashboard, IDoctorImageUpload, IDoctorKycRegisterInput, IMessageFromDoctor, IPrescriptionRequest, IPrescriptionResponse, IWalletResponse, IWalletTransaction, SlotInput } from "./doctorInterface";
import { IBookingListResponseDTO, IDoctorDashboardDTO } from "../../dtos/doctor.dto";


export interface IDoctorService {

  findRegisteredEmail(email: string): Promise<{ email?: string } | null>;
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
    doctorData: IDoctorKycRegisterInput,
    imgObject: IDoctorImageUpload
  ): Promise<void | string | null>;

  getDepartments(): Promise<Pick<IDepartment, "departmentName">[]>;

  updateDoctorProfile(
    doctorData: IDoctorModel,
    imgObject?: { profileImage?: string }
  ): Promise<void | IDoctorModel | null>;


  addDoctorSlots(slotData: SlotInput): Promise<{
    success: boolean;
    message: string;
  }>;

  // getDoctorSlotsForBooking(doctorId: string): Promise<ISlot[]>;

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
  ): Promise<IBookingListResponseDTO>;

  getWalletData(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<{ wallet: IWalletResponse | null; totalPages: number } | null>;

  deleteSlot(slotId: string): Promise<string>;

  getBookedUsers(doctorId: string): Promise<IBookedUser[]>;


  saveMessages(messageData: {
    senderId: string;
    receiverId: string;
    message: string;
    image: string | null;
  }): Promise<IMessageFromDoctor>;


  getMessages(
    receiverId: string,
    senderId: string
  ): Promise<IMessageFromDoctor[]>;

  savePrescription(presData: IPrescriptionRequest): Promise<string>;
  doctorDashBoard(doctorId: string): Promise<IDoctorDashboardDTO>;
}
