import { IDepartment } from "../../models/admin/departmentModel"
import IDoctorModel from "./doctorModelInterface"

interface IDoctorReprository {
    findByEmail(email: string): Promise<IDoctorModel | null>
    register(regEmail: string | null): Promise<IDoctorModel | null>
    doctorRepoKycRegister(doctorData: any, imgObject: any): Promise<IDoctorModel | null | void>
    getDepartments(): Promise<IDepartment[]>
    findEmailForLogin(email: string): Promise<IDoctorModel | null>

}

export default IDoctorReprository