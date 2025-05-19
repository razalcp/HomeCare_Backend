import { IAdmin } from '../models/admin/adminModel'
import { Model } from 'mongoose'
import { IDepartment } from '../models/admin/departmentModel'
import { IDoctor } from '../models/doctor/doctorModel'
import { IUserModel } from '../interfaces/user/userModelInterface'
import { IAdminWallet } from '../models/admin/adminWalletModel'



class AdminReprository {
    private adminModel: Model<IAdmin>
    private departmentModel: Model<IDepartment>
    private doctorModel: Model<IDoctor>
    private userModel: Model<IUserModel>
    private adminWalletModel: Model<IAdminWallet>
    constructor(adminModel: Model<IAdmin>, departmentModel: Model<IDepartment>, doctorModel: Model<IDoctor>, userModel: Model<IUserModel>, adminWalletModel: Model<IAdminWallet>) {


        this.adminModel = adminModel
        this.departmentModel = departmentModel
        this.doctorModel = doctorModel
        this.userModel = userModel
        this.adminWalletModel = adminWalletModel
    }

    getEmailAndPassword = async (email: String, password: String) => {

        return await this.adminModel.findOne({ email });


    };

    addDepartments = async (dept: String) => {
        try {
            // console.log(dept); 

            const data = await this.departmentModel.findOne({ departmentName: dept })

            if (data === null) {
                // console.log(this.departmentModel);
                try {
                    const obj = { departmentName: dept };
                    await this.departmentModel.create(obj);
                    const allData = await this.departmentModel.find()
                    return allData
                } catch (error) {
                    throw error
                }
            }
        } catch (error) {
            throw error
        }


    };




    getDepartments = async () => {
        try {
            return await this.departmentModel.find()

        } catch (error) {
            throw error
        }
    };

    updateListUnlist = async (departmentName: String) => {
        try {

            const department = await this.departmentModel.findOne({ departmentName });

            if (!department) {

                return null;
            }
            department.isListed = !department.isListed;
            const updatedDepartment = await department.save();
            return await this.departmentModel.find()

        } catch (error) {
            throw error
        }
    };


    getDoctors = async () => {
        try {
            return await this.doctorModel.find()
        } catch (error) {
            throw error
        }
    };

    updateKycStatus = async (status: String, doctorId: String) => {
        try {
            console.log(status, doctorId);

            // const validDoctorId = new mongoose.Types.ObjectId(doctorId);
            const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
                doctorId,
                { $set: { kycStatus: status } }, // Updating the kycStatus field
                { new: true } // Return the updated document
            );
            return updatedDoctor

        } catch (error) {

        }
    };


    getPatients = async () => {
        try {
            const getData = await this.userModel.find()
            return getData
        } catch (error) {
            throw error
        }
    };

    updateuserIsBlocked = async (buttonName: string, id: string) => {
        try {
            // console.log("Inside serviz ", buttonName, id);

            const isUserBlocked = buttonName === "Block";

            // Update the document and return the updated user.
            const updatedUser = await this.userModel.findByIdAndUpdate(
                id,
                { isUserBlocked },
                { new: true }
            );
            // console.log(updatedUser);

            return updatedUser;
        } catch (error) {
            console.error("Error updating user block status:", error);
            throw error;
        }
    };

    getWalletData = async (adminId: string) => {
        try {
            const wallet = await this.adminWalletModel.findOne({ adminId });
            return wallet; // or throw if not found
        } catch (error) {
            console.error('Error fetching doctor wallet:', error);
            throw new Error('Failed to fetch wallet');
        }
    };

};



export default AdminReprository