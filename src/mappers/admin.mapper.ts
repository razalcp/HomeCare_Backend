
import { AdminDto, DepartmentDTO, IPatientDTO, WalletDTO } from '../dtos/admin.dto';
import { IUserModel } from '../interfaces/user/userModelInterface';
import { IAdminAuth, IDashboardData, IDepartmentResponse, IGetWalletDataResponse, IMonthlyDashboardEntry } from '../interfaces/admin/AdminInterface';
import { IDepartment } from '../models/admin/departmentModel';
import IDoctorModel from '../interfaces/doctor/doctorModelInterface';

export const mapAdminToDto = (admin: IAdminAuth): AdminDto => {
  return {
    _id: admin._id.toString(),
    email: admin.email,
  };
};

export const mapPatientToDTO = (patient: IUserModel): IPatientDTO => ({
  _id: patient._id?.toString() || '',
  name: patient.name,
  email: patient.email,
  mobile: patient.mobile,
  isUserBlocked: patient.isUserBlocked,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});

export const toDepartmentDTO = (department: IDepartment): DepartmentDTO => ({
  _id: department._id,
  departmentName: department.departmentName,
  isListed: department.isListed,
});

export interface DoctorDTO extends IDoctorModel { }

export const toDoctorDTO = (doc: IDoctorModel & { __v?: any }): IDoctorModel => {
  const { __v, ...rest } = doc;
  return rest;
};


export const toWalletDTO = (wallet: IGetWalletDataResponse): WalletDTO => {
  return {
    _id: wallet._id,
    adminId: wallet.adminId,
    balance: wallet.balance,
    transactions: wallet.transactions.map(tx => ({
      _id: tx._id,
      amount: tx.amount,
      transactionId: tx.transactionId,
      transactionType: tx.transactionType,
      date: tx.date,
      appointmentId: tx.appointmentId
    })),
    totalTransactions: wallet.totalTransactions,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt
  };
};


export const MonthlyDashboardDTO = (data: IMonthlyDashboardEntry): IMonthlyDashboardEntry => ({
  month: data.month,
  revenue: data.revenue,
  users: data.users,
  bookings: data.bookings
});

export const DashboardDTO = (data: IDashboardData): IDashboardData => ({
  totalRevenue: data.totalRevenue,
  totalUsers: data.totalUsers,
  totalDoctors: data.totalDoctors,
  activeUsers: data.activeUsers,
  adminRevenue: data.adminRevenue,
  doctorRevenue: data.doctorRevenue,
  activeDoctors: data.activeDoctors,
  totalBookings: data.totalBookings,
  monthlyDashBoardData: data.monthlyDashBoardData
});

export const DepartmentResponseDTO = (data: IDepartmentResponse): IDepartmentResponse => ({
  _id: data._id.toString(),
  departmentName: data.departmentName,
  isListed: data.isListed
});