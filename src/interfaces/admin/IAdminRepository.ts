import { IDepartment } from "../../models/admin/departmentModel";
import { IAdminAuth, IDashboardData, IDepartmentResponse, IDoctorData, IGetDepartmentsResponse, IGetWalletDataResponse, IPaginatedPatientResponse, PaginatedDoctorResponse } from "./AdminInterface";

export interface IAdminRepository {
    getEmailAndPassword(email: string): Promise<IAdminAuth | null>;
    addDepartments(dept: string): Promise<IDepartment[] | undefined>;
    getDepartments(page: number, limit: number): Promise<IGetDepartmentsResponse>;
    updateListUnlist: (departmentName: string) => Promise<IDepartment[]>;
    getDoctors: (page: number, limit: number) => Promise<PaginatedDoctorResponse>;
    updateKycStatus: (status: string, doctorId: string) => Promise<IDoctorData | null>;
    getPatients: (page: number, limit: number,search:string) => Promise<IPaginatedPatientResponse>;
    updateuserIsBlocked: (buttonName: string, id: string) => Promise<string>;
    getWalletData: (
        adminId: string,
        page: number,
        limit: number
    ) => Promise<IGetWalletDataResponse>;
    findDashBoardData(): Promise<IDashboardData>;
    updateDepartment(
        departmentId: string,
        departmentName: string
    ): Promise<IDepartmentResponse>;
}