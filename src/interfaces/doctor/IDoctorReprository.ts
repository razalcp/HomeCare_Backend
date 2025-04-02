import { IDepartment } from "../../models/admin/departmentModel"
import { ISlot } from "../../models/doctor/slotModel"
import IDoctorModel from "./doctorModelInterface"

interface IDoctorReprository {
    findByEmail(email: string): Promise<IDoctorModel | null>
    register(regEmail: string | null): Promise<IDoctorModel | null>
    doctorRepoKycRegister(doctorData: any, imgObject: any): Promise<IDoctorModel | null | void>
    getDepartments(): Promise<IDepartment[]>
    findEmailForLogin(email: string): Promise<IDoctorModel | null>
    // addDoctorSlots(slotData:any): Promise<IDoctorModel | null | void>;
    addDoctorSlots(slotData: ISlot | ISlot[]): Promise<{ success: boolean; message: string }>;

     getDoctorSlots(doctorId: string): Promise<ISlot[]>
    updateDoctor(doctorId: string, updateData: Partial<IDoctorModel>, imgObject?: any): Promise<IDoctorModel | null | void>; 
}


export default IDoctorReprository