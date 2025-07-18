import { IDepartment } from "../../models/admin/departmentModel"
import { IWallet } from "../../models/doctor/doctorWalletModel"
import { ISlot } from "../../models/doctor/slotModel"
import { IBookedUser, IDoctorDashboard, IDoctorImageUpload, IDoctorKycRegisterInput, IGetMyBookingsResponse, IMessageFromDoctor, IPrescriptionRequest, IPrescriptionResponse, IWalletResponse, IWalletTransaction } from "./doctorInterface"
import IDoctorModel from "./doctorModelInterface"


interface IDoctorReprository {

    findByEmail(email: string): Promise<{ email?: string } | null>
    findEmailForLogin(email: string): Promise<IDoctorModel | null>
    doctorRepoKycRegister(doctorData: IDoctorKycRegisterInput, imgObject: IDoctorImageUpload): Promise<IDoctorModel | null | void>
    updateDoctor(
        doctorData: IDoctorModel,
        imgObject: { profileImage: string }
    ): Promise<void | IDoctorModel | null>;

    register(regEmail: string | null): Promise<IDoctorModel | null>
    getDepartments(): Promise<IDepartment[]>
    addDoctorSlots(slotData: ISlot | ISlot[]): Promise<{ success: boolean; message: string }>;
    getDoctorSlotsForBooking(doctorId: string): Promise<ISlot[]>;

    getDoctorSlots(
        doctorId: string,
        page: number,
        limit: number
    ): Promise<{
        slots: ISlot[];
        total: number;
    }>;

    getMyBookings(doctorId: string, page: number, limit: number): Promise<IGetMyBookingsResponse>;

    getWalletData(
        doctorId: string,
        page: number,
        limit: number
    ): Promise<{
        wallet: IWalletResponse
        totalPages: number;
    } | null>;

    getBookedUsers(doctorId: string): Promise<IBookedUser[]>;

    saveMessages(messageData: {
        senderId: string;
        receiverId: string;
        message: string;
        image: string | null;
    }): Promise<IMessageFromDoctor>;

    findMessage(
        receiverId: string,
        senderId: string
    ): Promise<IMessageFromDoctor[]>;

    deleteSlot(slotId: string): Promise<string>;
    savePrescription(presData: IPrescriptionRequest): Promise<string>;
    getPrescription(bookingId: string): Promise<IPrescriptionResponse>;
    doctorDashboard(doctorId: string): Promise<IDoctorDashboard>;

}


export default IDoctorReprository