
import IDoctorModel from "../interfaces/doctor/doctorModelInterface"
import IDoctorReprository from "../interfaces/doctor/IDoctorReprository"
import { Model } from 'mongoose'
import { IDepartment } from "../models/admin/departmentModel"
import { ISlot } from "../models/doctor/slotModel"
class DoctorReprository implements IDoctorReprository {
    private doctorModel: Model<IDoctorModel>
    private departmentModel: Model<IDepartment>
    private slotModel: Model<ISlot>
    constructor(doctorModel: Model<IDoctorModel>, departmentModel: Model<IDepartment>, slotModel: Model<ISlot>) {

        this.doctorModel = doctorModel
        this.departmentModel = departmentModel
        this.slotModel = slotModel
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

        try {
            const doct = await this.doctorModel.findOne({ email })


            return doct
        } catch (error) {
            throw error
        }
    }

    doctorRepoKycRegister = async (doctorData: any, imgObject: any) => {





        const existingUser = await this.doctorModel.findOne({ email: doctorData.email })

        if (existingUser) {


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

    updateDoctor = async (doctorData: any, imgObject: any) => {


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
        console.log("Inside regi ", regEmail);

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


    addDoctorSlots = async (slotData: ISlot | ISlot[]) => {
          
        try {
            if (Array.isArray(slotData)) {
                // Handling array case
                          
                for (const slot of slotData) {
                    const existingSlot = await this.slotModel.findOne({
                        doctorId: slot.doctorId,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });

                    if (existingSlot) {
                        throw new Error(`Slot already added for this date and time`);
                    }
                }

                // If no duplicate, insert all slots
                await this.slotModel.insertMany(slotData);
            } else {
                // Handling object case
                const existingSlot = await this.slotModel.findOne({
                    doctorId: slotData.doctorId,
                    date: slotData.date,
                    startTime: slotData.startTime,
                    endTime: slotData.endTime
                });

                if (existingSlot) {
                    throw new Error(`Slot already added for ${slotData.date} from ${slotData.startTime} to ${slotData.endTime}`);
                }

                // Insert new slot
                const newSlot = new this.slotModel(slotData);
                await newSlot.save();
            }

            return { success: true, message: "Slot(s) added successfully" };
        } catch (error: any) {
            console.log("error.message",error.message);
            
            throw new Error(error.message)
        }
    };

    getDoctorSlots = async (doctorId:string) => {
        return await this.slotModel.find({ doctorId });
    };

}



export default DoctorReprository