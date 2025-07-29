import { Types } from "mongoose";
import { IPatientDTO } from "../../dtos/admin.dto";
import { IDepartment } from "../../models/admin/departmentModel";
import IDoctorModel from "../doctor/doctorModelInterface";
import { IUserModel } from "../user/userModelInterface";
import { ITransaction } from "../../models/admin/adminWalletModel";



export interface PaginatedDepartmentResult {
    data: IDepartment[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface PaginatedDoctorResponse {
    data: IDoctorModel[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}


export interface PaginatedPatientResponseDTO {
    data: IPatientDTO[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface IGetWalletDataResponse {
    _id: Types.ObjectId;
    adminId: string;
    balance: number;
    transactions: ITransaction[];
    totalTransactions: number;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface IMonthlyDashboardEntry {
    month: string;
    revenue: number;
    users: number;
    bookings: number;
}

export interface IDashboardData {
    totalRevenue: number;
    totalUsers: number;
    totalDoctors: number;
    activeUsers: number;
    adminRevenue: number;
    doctorRevenue: number;
    activeDoctors: number;
    totalBookings: number;
    monthlyDashBoardData: IMonthlyDashboardEntry[];
}


export interface IAdminAuth {
    _id: string;
    email: string;
    password: string;
}




export interface IGetDepartmentsResponse {
    data: IDepartment[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface IDoctorData {
    _id: Types.ObjectId;
    email: string;
    slotId: string[];
    departments: string[];
    knownLanguages: string[];
    consultationType: string[];
    certifications: string[];
    isVerified: boolean;
    kycStatus: 'Pending' | 'Approved' | 'Rejected';
    createdAt: Date;
    updatedAt: Date;
    __v: number;
    bio: string;
    certifications0?: string;
    certifications1?: string;
    consultationFee: number;
    country: string;
    dateOfBirth: string;
    degree: string;
    experience: string;
    institution: string;
    medicalLicenceNumber: string;
    name: string;
    profileImage: string;
    state: string;
    year: string;
}


export interface IPaginatedPatientResponse {
    data: IUserModel[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
};

export interface IDepartmentResponse {
    _id: string;
    departmentName: string;
    isListed: boolean;
    
}

