import { IDepartment } from "../../models/admin/departmentModel"
import { IWallet } from "../../models/doctor/doctorWalletModel"
import { ISlot } from "../../models/doctor/slotModel"
import { IBooking } from "../../models/user/bookingModel"
import IDoctorModel from "./doctorModelInterface"

interface IDoctorReprository {
    [x: string]: any
    findByEmail(email: string): Promise<IDoctorModel | null>
    register(regEmail: string | null): Promise<IDoctorModel | null>
    doctorRepoKycRegister(doctorData: any, imgObject: any): Promise<IDoctorModel | null | void>
    getDepartments(): Promise<IDepartment[]>
    findEmailForLogin(email: string): Promise<IDoctorModel | null>
    addDoctorSlots(slotData: ISlot | ISlot[]): Promise<{ success: boolean; message: string }>;
    getDoctorSlots(doctorId: string): Promise<ISlot[]>
    updateDoctor(doctorId: string, updateData: Partial<IDoctorModel>, imgObject?: any): Promise<IDoctorModel | null | void>;
    getMyBookings(doctorId: string): Promise<IBooking[]>;
    getWalletData(doctorId: string): Promise<IWallet>;
}


export default IDoctorReprository