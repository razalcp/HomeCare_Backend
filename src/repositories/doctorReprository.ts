
import IDoctorModel from "../interfaces/doctor/doctorModelInterface"
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository"
import { Model } from 'mongoose'
import { IDepartment } from "../models/admin/departmentModel"
class DoctorReprository implements IDoctorReprository {
    private doctorModel: Model<IDoctorModel>
    private departmentModel: Model<IDepartment>

    constructor(doctorModel: Model<IDoctorModel>, departmentModel: Model<IDepartment>) {

        this.doctorModel = doctorModel
        this.departmentModel = departmentModel
    }

    findByEmail = async (email: string): Promise<IDoctorModel | null> => {
        // console.log("Inside Doctor Reprository ", email);
        try {
            return await this.doctorModel.findOne({ email })
        } catch (error) {
            throw error
        }
    }

    findEmailForLogin = async (email: string): Promise<IDoctorModel | null> => {
        // console.log("Inside Doctor Reprository ", email);
        try {
            const doct = await this.doctorModel.findOne({ email })
            // console.log("Repo doc", doct);

            return doct
        } catch (error) {
            throw error
        }
    }

    doctorRepoKycRegister = async (doctorData: any, imgObject: any) => {


        // console.log("repo doctorData ", doctorData);
        // console.log("repo imgObject ", imgObject);

        const existingUser = await this.doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {
            // console.log("Inside existingUser");

            const updatedUser = await this.doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

        // const mergedObj = { ...doctorData, ...imgObject }

        // return await this.doctorModel.create(mergedObj);

    };

    updateDoctor =async (doctorData: any, imgObject: any) => {


        // console.log("repo doctorData ", doctorData);
        // console.log("repo imgObject ", imgObject);

        const existingUser = await this.doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {
            // console.log("Inside existingUser");

            const updatedUser = await this.doctorModel.findOneAndUpdate(
                { email: doctorData.email },
                { $set: { ...doctorData, ...imgObject } },
                { new: true }
            )
            return updatedUser
        } else {
            throw new Error("Email not registered")
        }

        // const mergedObj = { ...doctorData, ...imgObject }

        // return await this.doctorModel.create(mergedObj);

    };

    register = async (regEmail: string | null) => {
        // console.log("Inside regi ",regEmail);

        const obj = { email: regEmail }

        try {
            const alreadyExistingUser = await this.doctorModel.findOne({ email: regEmail })
            if (!alreadyExistingUser) {
                return await this.doctorModel.create(obj)
            }
            return alreadyExistingUser
        } catch (error) {
            throw error
        }

    };

    getDepartments = async () => {
        const data = await this.departmentModel.find(
            { isListed: true }, // Filter: isListed should be true
            { _id: 0, departmentName: 1 } // Projection: Only return departmentName, exclude _id
        );
        // console.log("This is departments " , data);
        return data

    };



}

export default DoctorReprository