import { Mongoose, Types } from "mongoose";

export interface AdminDto {
  _id: string;
  email: string;
}


export interface IPatientDTO {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isUserBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepartmentDTO {
    _id:Types.ObjectId;
     departmentName: string;
    isListed: boolean;
}

export interface TransactionDTO {
  _id?: Types.ObjectId;
  amount: number;
  transactionId: string;
  transactionType: 'credit' | 'debit';
  date?: Date;
  appointmentId?: string;
}

export interface WalletDTO {
  _id: Types.ObjectId;
  adminId: string;
  balance: number;
  transactions: TransactionDTO[];
  totalTransactions: number;
  createdAt?: Date;
  updatedAt?: Date;
}