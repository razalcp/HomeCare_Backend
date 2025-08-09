import { IAdmin } from '../models/admin/adminModel'
import { Model } from 'mongoose'
import { DepartmentDocument, IDepartment } from '../models/admin/departmentModel'
import { IDoctor } from '../models/doctor/doctorModel'
import { IUserModel } from '../interfaces/user/userModelInterface'
import { IAdminWallet } from '../models/admin/adminWalletModel'
import IDoctorModel from '../interfaces/doctor/doctorModelInterface'
import { IAdminRepository } from '../interfaces/admin/IAdminRepository'
import { IAdminAuth, IDoctorData } from '../interfaces/admin/AdminInterface'
import { IWallet } from '../models/doctor/doctorWalletModel'
import { IBooking } from '../models/user/bookingModel'
import BaseRepository from './baseRepository'
import DepartmentModel from '../models/admin/departmentModel'

//getDepartments and getEmailAndPassword

class AdminReprository extends BaseRepository<IAdmin> implements IAdminRepository {

    private _departmentModel: Model<IDepartment>
    private _doctorModel: Model<IDoctor>
    private _userModel: Model<IUserModel>
    private _adminModel: Model<IAdmin>
    private _adminWalletModel: Model<IAdminWallet>
    private _doctorWalletModel: Model<IWallet>
    private _bookingModel: Model<IBooking>
    private _departmentRepo: BaseRepository<DepartmentDocument>;

    constructor(adminModel: Model<IAdmin>, departmentModel: Model<IDepartment>, doctorModel: Model<IDoctor>, userModel: Model<IUserModel>, adminWalletModel: Model<IAdminWallet>, doctorWalletModel: Model<IWallet>, bookingModel: Model<IBooking>) {
        super(adminModel);
        this._departmentRepo = new BaseRepository<DepartmentDocument>(DepartmentModel);
        this._adminModel = adminModel
        this._departmentModel = departmentModel
        this._doctorModel = doctorModel
        this._userModel = userModel
        this._adminWalletModel = adminWalletModel
        this._doctorWalletModel = doctorWalletModel
        this._bookingModel = bookingModel

    }

    getEmailAndPassword = async (email: string): Promise<IAdminAuth | null> => {
        // const admin = await this._adminModel.findOne({ email });
        const admin = await this.findOne({ email });

        if (!admin) return null;

        return {
            _id: admin._id,
            email: admin.email,
            password: admin.password,
        };
    };

    addDepartments = async (dept: String) => {
        try {
            const data = await this._departmentModel.findOne({ departmentName: dept })
            if (data === null) {
                try {
                    const obj = { departmentName: dept };
                    await this._departmentModel.create(obj);
                    const allData = await this._departmentModel.find()
                    return allData
                } catch (error) {
                    throw error
                }
            }
        } catch (error) {
            throw error
        }


    };

    getDepartments = async (
        page: number,
        limit: number,
        search: string
    ) => {
        try {
            const filter = search
                ? { departmentName: { $regex: search, $options: 'i' } }
                : {};

            const result = await this._departmentRepo.findWithPagination(filter, page, limit);

            const data = result.data as unknown as IDepartment[];

            return {
                ...result,
                data,
            };

        } catch (error) {
            throw error;
        }
    };



    updateListUnlist = async (departmentName: string) => {
        try {

            const department = await this._departmentModel.findOne({ departmentName });

            if (!department) {
                return [];
            }
            department.isListed = !department.isListed;
            const updatedDepartment = await department.save();
            return await this._departmentModel.find()

        } catch (error) {
            throw error
        }
    };


    getDoctors = async (page: number, limit: number) => {
        try {
            const skip = (page - 1) * limit;

            const query = {
                name: { $exists: true, $ne: "" },
                degree: { $exists: true, $ne: "" },
                profileImage: { $exists: true, $ne: "" },
                medicalLicenceNumber: { $exists: true, $ne: "" }
            };

            const [data, totalCount] = await Promise.all([
                this._doctorModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean<IDoctorModel[]>(),
                this._doctorModel.countDocuments(query)
            ]);

            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    };



    updateKycStatus = async (status: string, doctorId: string): Promise<IDoctorData | null> => {
        try {

            const updatedDoctor = await this._doctorModel.findByIdAndUpdate(
                doctorId,
                { $set: { kycStatus: status } },
                { new: true } // Return the updated document
            )

            return updatedDoctor as IDoctorData | null;

        } catch (error) {
            throw error;
        }
    };

    getPatients = async (page: number, limit: number, search: string) => {
        try {
            const skip = (page - 1) * limit;

            const searchQuery = search
                ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { mobile: { $regex: search, $options: "i" } },
                    ],
                }
                : {};

            const [data, totalCount] = await Promise.all([
                this._userModel.find(searchQuery).skip(skip).limit(limit),
                this._userModel.countDocuments(searchQuery),
            ]);

            return {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            };
        } catch (error) {
            throw error;
        }
    };


    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            const isUserBlocked = buttonName === "Block";

            // Update the document and return the updated user.
            const updatedUser = await this._userModel.findByIdAndUpdate(
                id,
                { isUserBlocked },
                { new: true }
            );
            return buttonName
        } catch (error) {
            console.error("Error updating user block status:", error);
            throw error;
        }
    };

    getWalletData = async (adminId: string, page: number, limit: number, search = "", type?: string) => {
        try {
            const wallet = await this._adminWalletModel.findOne({ adminId });

            if (!wallet) throw new Error("Wallet not found");

            // Filter and search
            let filteredTransactions = wallet.transactions;

            if (type && (type === "credit" || type === "debit")) {
                filteredTransactions = filteredTransactions.filter(tx => tx.transactionType === type);
            }

            if (search) {
                const lowerSearch = search.toLowerCase();
                filteredTransactions = filteredTransactions.filter((tx) =>
                    tx.transactionId.toLowerCase().includes(lowerSearch) ||
                    tx.transactionType.toLowerCase().includes(lowerSearch) ||
                    tx.amount.toString().includes(lowerSearch) ||
                    (tx.date && new Date(tx.date).toLocaleString().toLowerCase().includes(lowerSearch))
                );
            }

            // Sort & paginate
            const sorted = filteredTransactions.sort(
                (a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()
            );
            const totalTransactions = sorted.length;
            const startIndex = (page - 1) * limit;
            const paginated = sorted.slice(startIndex, startIndex + limit);

            return {
                _id: wallet._id,
                adminId: wallet.adminId,
                balance: wallet.balance,
                transactions: paginated,
                totalTransactions,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt,
            };
        } catch (error) {
            throw new Error("Failed to fetch wallet");
        }
    };


    findDashBoardData = async () => {
        try {

            const adminId = "admin";
            const result = await this._adminWalletModel.aggregate([
                { $match: { adminId } },
                { $unwind: '$transactions' },
                { $match: { 'transactions.transactionType': 'credit' } },
                {
                    $group: {
                        _id: null,
                        totalCredit: { $sum: '$transactions.amount' }
                    }
                }
            ]);

            const adminRevenue = result[0]?.totalCredit || 0;


            const revenueResult = await this._doctorWalletModel.aggregate([
                { $unwind: '$transactions' },
                { $match: { 'transactions.transactionType': 'credit' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$transactions.amount' }
                    }
                }
            ]);

            const doctorRevenue = revenueResult[0]?.totalRevenue || 0;

            const totalRevenue = adminRevenue + doctorRevenue;

            const totalUsers = await this._userModel.countDocuments();

            const activeUsers = await this._userModel.countDocuments({ isUserBlocked: false });


            const totalDoctors = await this._doctorModel.countDocuments();


            const activeDoctors = await this._doctorModel.countDocuments({ kycStatus: 'Approved' });


            const totalBookings = await this._bookingModel.countDocuments();

            const data = await this.getMonthlyDashboardData()


            return {
                totalRevenue: totalRevenue,
                totalUsers: totalUsers,
                totalDoctors: totalDoctors,
                activeUsers: activeUsers,
                adminRevenue: adminRevenue,
                doctorRevenue: doctorRevenue,
                activeDoctors: activeDoctors,
                totalBookings: totalBookings,
                monthlyDashBoardData: data
            }
        } catch (error) {
            throw error
        }
    };

    getMonthlyDashboardData = async () => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const [adminRevenue, doctorRevenue, users, bookings] = await Promise.all([
            this._adminWalletModel.aggregate([
                { $unwind: "$transactions" },
                { $match: { "transactions.transactionType": "credit" } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$transactions.date" },
                            year: { $year: "$transactions.date" },
                        },
                        revenue: { $sum: "$transactions.amount" },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", revenue: 1 } },
            ]),

            this._doctorWalletModel.aggregate([
                { $unwind: "$transactions" },
                { $match: { "transactions.transactionType": "credit" } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$transactions.date" },
                            year: { $year: "$transactions.date" },
                        },
                        revenue: { $sum: "$transactions.amount" },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", revenue: 1 } },
            ]),

            this._userModel.aggregate([
                { $match: { createdAt: { $ne: null } } }, // <--- Add this line
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" },
                        },
                        users: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id.month",
                        year: "$_id.year",
                        users: 1,
                    },
                },
            ]),


            this._bookingModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" },
                        },
                        bookings: { $sum: 1 },
                    },
                },
                { $project: { _id: 0, month: "$_id.month", year: "$_id.year", bookings: 1 } },
            ]),
        ]);

        const resultMap = new Map<string, { month: string; revenue: number; users: number; bookings: number }>();

        const merge = (data: any[], key: "revenue" | "users" | "bookings") => {
            for (const item of data) {
                const id = `${item.year}-${item.month}`;
                const monthName = monthNames[item.month - 1];

                if (!resultMap.has(id)) {
                    resultMap.set(id, { month: monthName, revenue: 0, users: 0, bookings: 0 });
                }

                resultMap.get(id)![key] += item[key];
            }
        };

        merge(adminRevenue, "revenue");
        merge(doctorRevenue, "revenue");
        merge(users, "users");
        merge(bookings, "bookings");

        const sortedData = Array.from(resultMap.values()).sort(
            (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
        );

        return sortedData;
    };

    updateDepartment = async (departmentId: string, departmentName: string) => {
        try {
            const updatedDepartment = await this._departmentModel.findByIdAndUpdate(
                departmentId,
                { departmentName },
                { new: true } // returns the updated document
            );

            if (!updatedDepartment) {
                throw new Error("Department not found");
            }

            return {
                _id: updatedDepartment._id.toString(),
                departmentName: updatedDepartment.departmentName,
                isListed: updatedDepartment.isListed,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Failed to update department");
            }
        }
    };


};



export default AdminReprository