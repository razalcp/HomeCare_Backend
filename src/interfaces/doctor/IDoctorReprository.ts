import { IDepartment } from "../../models/admin/departmentModel"
import { ISlot } from "../../models/doctor/slotModel"
import IDoctorModel from "./doctorModelInterface"


interface IDoctorReprository {
    [x: string]: any
    findByEmail(email: string): Promise<IDoctorModel | null>
    register(regEmail: string | null): Promise<IDoctorModel | null>
    doctorRepoKycRegister(doctorData: any, imgObject: any): Promise<IDoctorModel | null | void>
    getDepartments(): Promise<IDepartment[]>
    findEmailForLogin(email: string): Promise<IDoctorModel | null>
    addDoctorSlots(slotData: ISlot | ISlot[]): Promise<{ success: boolean; message: string }>;
    getDoctorSlots(doctorId: string, page: number, limit: number): Promise<any>
    // updateDoctor(doctorId: string, updateData: Partial<IDoctorModel>, imgObject?: any): Promise<IDoctorModel | null | void>;
    updateDoctor(
        doctorData: IDoctorModel,
        imgObject: { profileImage: string }
    ): Promise<void | IDoctorModel | null>;
    getMyBookings(doctorId: string, page: number, limit: number): Promise<any>;
    getWalletData(doctorId: string, page: number, limit: number): Promise<any>;
    deleteSlot(slotId: string): Promise<string>;
}


export default IDoctorReprository