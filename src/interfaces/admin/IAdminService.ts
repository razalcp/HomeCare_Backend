import { AdminDto } from "../../dtos/admin.dto";
import { IDepartment } from "../../models/admin/departmentModel";
import { IDashboardData, IDepartmentResponse, IGetWalletDataResponse, PaginatedDepartmentResult, PaginatedDoctorResponse, PaginatedPatientResponseDTO } from "./AdminInterface";


interface IAdminService {
    checkWetherAdmin: (
        email: string,
        password: string
    ) => Promise<
        | {
            data: AdminDto;
            adminToken: string;
            adminRefreshToken: string;
        }
        | undefined
    >;

    addDepartments: (dept: string) => Promise<IDepartment[] | undefined>;
    getDepartments: (page: number, limit: number) => Promise<PaginatedDepartmentResult>;
    updateListUnlist: (departmentName: string) => Promise<IDepartment[]>;
    getDoctorData: (page: number, limit: number) => Promise<PaginatedDoctorResponse>;
    updateKycStatus(status: string, doctorId: string): Promise<void>;
    getPatients(page: number, limit: number): Promise<PaginatedPatientResponseDTO>;
    updateuserIsBlocked(buttonName: string, id: string): Promise<void>;
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



export default IAdminService