import { IUserRepository } from "../interfaces/user/IUserReprository";
import { IUserModel } from "../interfaces/user/userModelInterface";
import { Model } from "mongoose";
import { IUser, IUserAuth } from "../interfaces/user/userInterface";
import { IDoctor } from "../models/doctor/doctorModel";
import { ISlot } from "../models/doctor/slotModel";
import { IBooking } from "../models/user/bookingModel";
import doctorWalletModel, { IWallet } from "../models/doctor/doctorWalletModel";
import { IAdminWallet } from "../models/admin/adminWalletModel";
import { IUserWallet } from "../models/user/userWalletModel";

class UserReprository implements IUserRepository {
  private userModel = Model<IUserModel>;
  private doctorModel = Model<IDoctor>
  private slotModel = Model<ISlot>
  private bookingModel = Model<IBooking>
  private doctorWalletModel = Model<IWallet>
  private adminWalletModel = Model<IAdminWallet>
  private userWalletModel = Model<IUserWallet>
  constructor(userModel: Model<IUserModel>, doctorModel: Model<IDoctor>, slotModel: Model<ISlot>, bookingModel: Model<IBooking>, doctorWalletModel: Model<IWallet>, adminWalletModel: Model<IAdminWallet>, userWalletModel: Model<IUserWallet>) {
    this.userModel = userModel;
    this.doctorModel = doctorModel
    this.slotModel = slotModel
    this.bookingModel = bookingModel
    this.doctorWalletModel = doctorWalletModel
    this.adminWalletModel = adminWalletModel
    this.userWalletModel = userWalletModel
  }

  findByEmail = async (email: string): Promise<IUser | null> => {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  };

  register = async (userData: IUser): Promise<IUser> => {
    try {
      return await this.userModel.create(userData);
    } catch (error) {
      throw error;
    }
  };

  login = async (email: string): Promise<IUser | null> => {
    try {
      const singleUser = await this.userModel.findOne({ email })

      if (singleUser.isUserBlocked === false) {

        return singleUser;
      } else {
        // console.log("blocked");

        throw new Error("User is blocked")
      }

    } catch (error) {
      throw error
    }
  }

  getVerifiedDoctors = async () => {
    try {
      const data = await this.doctorModel.find({ kycStatus: "Approved" })

      return data

    } catch (error) {
      throw error
    }
  }

  saveBookingToDb = async (slotId: any, userId: any, doctorId: any) => {
    try {
      // console.log("Inside Reprository ", slotId, userId, doctorId);

      if (slotId) {
        const slot = await this.slotModel.findById(slotId);

        if (!slot) {
          throw new Error("Slot not found");
        }

        if (slot.isBooked) {
          throw new Error("Slot already booked");
        }

        await this.slotModel.findByIdAndUpdate(slotId, {
          isBooked: true,
          status: "Booked"
        });

        // console.log("Slot updated successfully.");
      }
      // Step 2: Save booking
      const newBooking = await this.bookingModel.create({
        doctorId,
        userId,
        slotId,
        paymentStatus: "paid"
      });

      await newBooking.save();
      // console.log("Booking saved successfully.");

      // 3. Get doctor's fee
      const doctor = await this.doctorModel.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      const doctorFees = doctor.consultationFee; // assuming `fees` field exists in doctor collection
      // console.log("doctorFees",doctorFees);

      const doctorShare = Math.floor(doctorFees * 0.7);
      const adminShare = doctorFees - doctorShare;
      // console.log("doctorShare",doctorShare);

      const bookingId = newBooking._id.toString();
      // console.log("bookingId",bookingId);


      // 4. Update Doctor Wallet
      const doctorWallet = await this.doctorWalletModel.findOne({ doctorId });
      console.log("doc wallet found ", doctorWallet);

      if (doctorWallet) {
        doctorWallet.balance += doctorShare;
        doctorWallet.transactions.push({
          amount: doctorShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await doctorWallet.save();
      } else {
        // console.log("new doctor wallet creatted");

        // If wallet doesn't exist, create it
        const wal = await this.doctorWalletModel.create({
          doctorId,
          balance: doctorShare,
          transactions: [{
            amount: doctorShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });
        // console.log("creayd wallet",wal);

      }
      const adminId = "admin"; // or however you define it

      let adminWallet = await this.adminWalletModel.findOne({ adminId });

      if (!adminWallet) {
        // If no wallet exists, create one
        adminWallet = await this.adminWalletModel.create({
          adminId,
          balance: adminShare,
          transactions: [{
            amount: adminShare,
            transactionId: bookingId,
            transactionType: "credit",
            appointmentId: bookingId
          }]
        });
        // console.log("Admin wallet created.");
      } else {
        // Update existing wallet
        adminWallet.balance += adminShare;
        adminWallet.transactions.push({
          amount: adminShare,
          transactionId: bookingId,
          transactionType: "credit",
          appointmentId: bookingId
        });
        await adminWallet.save();
        // console.log("✅ Admin wallet updated.");
      }

    } catch (error) {

    }
  }

  getUserBookings = async (userId: string) => {
    try {
      // console.log("Inside UserRepository getUserBookings method, this is userID:", userId);

      const bookings = await this.bookingModel.find({ userId })
        .populate('doctorId') // populate doctor details
        .populate('slotId')   // populate slot details
        .populate('userId');  // populate user info
      // console.log(bookings);

      return bookings;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  };



  cancelBooking = async (bookingId: string) => {
    try {
      // Step 1: Find the booking
      const booking = await this.bookingModel.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const { slotId, doctorId, userId } = booking;

      // Step 2: Update the slot as available
      await this.slotModel.findByIdAndUpdate(slotId, {
        status: 'Available',
        isBooked: false,
      });

      // Step 3: Get doctor wallet and find the matching transaction
      const doctorWallet = await this.doctorWalletModel.findOne({ doctorId });
      if (!doctorWallet) throw new Error('Doctor wallet not found');

      const transaction = doctorWallet.transactions.find(
        (tx: any) => tx.transactionId === bookingId
      );
      if (!transaction) throw new Error('Transaction not found in doctor wallet');

      const amountToRefund = transaction.amount;

      // Step 4: Deduct amount from doctor and save debit transaction
      doctorWallet.balance -= amountToRefund;
      doctorWallet.transactions.push({
        amount: amountToRefund,
        transactionId: bookingId,
        transactionType: 'debit',
        appointmentId: bookingId,
        date: new Date(),
      });
      await doctorWallet.save();

      // Step 5: Find or create user wallet
      let userWallet = await this.userWalletModel.findOne({ userId });

      if (!userWallet) {
        userWallet = this.userWalletModel.create({
          userId,
          balance: amountToRefund,
          transactions: [{
            amount: amountToRefund,
            transactionId: bookingId,
            transactionType: 'credit',
            appointmentId: bookingId,
            date: new Date(),
          }],
        });
      } else {
        userWallet.balance += amountToRefund;
        userWallet.transactions.push({
          amount: amountToRefund,
          transactionId: bookingId,
          transactionType: 'credit',
          appointmentId: bookingId,
          date: new Date(),
        });
      }

      await userWallet.save();

      // Step 6: Delete the booking
      await this.bookingModel.findByIdAndDelete(bookingId);

      // console.log('Booking cancelled, slot available, amount refunded');
      return { message: "Booking Cancelled Successfully" }
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      throw error;
    }
  };

  getWalletData = async (userId: string) => {
    try {
      const wallet = await this.userWalletModel.findOne({ userId });
      return wallet; // or throw if not found
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      throw new Error('Failed to fetch wallet');
    }
  };



  updateUser = async (userData: any, imgObject: any) => {
    // console.log("repo doctorData ", userData);
    // console.log("repo imgObject ", imgObject);

    const existingUser = await this.userModel.findOne({ email: userData.email });

    if (existingUser) {
      // Rename `profileImage` to `profileIMG`
      if (imgObject?.profileImage) {
        imgObject.profileIMG = imgObject.profileImage;
        delete imgObject.profileImage;
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email: userData.email },
        { $set: { ...userData, ...imgObject } },
        { new: true }
      );

      return updatedUser;
    } else {
      throw new Error("Email not registered");
    }
  };

  getUser = async (email: string): Promise<IUserAuth | null> => {
    // console.log("Inside Doctor Reprository ", email);
    try {
      const data = await this.userModel.findOne({ email })
      // console.log(data);

      return data
    } catch (error) {
      throw error
    }
  }

}

export default UserReprository;
