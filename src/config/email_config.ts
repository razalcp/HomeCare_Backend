import nodemailer, { Transporter } from "nodemailer";

import dotenv from "dotenv";


dotenv.config();

const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_USER as string,
    pass: process.env.Pass_USER as string,
  },
});

const sendEmail = async (email: string, otp: string): Promise<boolean> => {



  const mailOptions = {
    from: process.env.Email_User as string,
    to: email,
    subject: `HomeCare OTP Verification`,
    html: ` <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 30px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background-color: #513C2C; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to HomeCare!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px; color: #333333;">
              <p style="font-size: 1.1em; margin: 0 0 10px;">Hi,</p>
              <p style="line-height: 1.6;">
                Use the following <strong style="color: #4CAF50;">OTP</strong> to complete your registration procedures. This OTP is valid for <strong>2 minutes</strong>.
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="
                  display: inline-block;
                background: linear-gradient(90deg, rgba(87, 67, 66, 1) 14%, rgba(31, 20, 20, 1) 68%, rgba(57, 36, 36, 1) 100%);
                  color: #ffffff;
                  font-size: 24px;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                ">
                  ${otp}
                </span>
              </div>
              <p style="font-size: 0.9em; margin: 20px 0 0;">If you didn't request this OTP, please ignore this email.</p>
              <p style="font-size: 0.9em;">Regards,<br /><strong>HomeCare Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 0.8em; color: #777777;">
              <p style="margin: 0;">HomeCare Doctor Booking App &copy; 2024</p>
            </td>
          </tr>
        </table>
      </div> `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP Send to ${email} is ${otp}`);
    return true;
  } catch (error) {

    if (error instanceof Error) {
      if (
        error.message.includes("getaddrinfo ENOTFOUND") ||
        error.message.includes("connect ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      ) {
        console.error("Error: Internet connection required to send email.");
      } else {
        console.error("Error sending OTP email:", error.message);
      }
    } else {
      console.error("Unknown error occurred while sending email");
    }
    return false;
  }
};


const sendDoctorEmail = async (email: string, status: String,docName:String): Promise<boolean> => {




  const mailOptions = {
    from: process.env.Email_User as string,
    to: email,
    subject: `Your Registration Status: ${status}`,
    html: `
        <h2>Hello Dr. ${docName},</h2>
        <p>Your registration status has been updated to: <strong>${status}</strong>.</p>
        ${status === "Approved" ? 
            `<p>🎉 Congratulations! You can now log in and start using our platform.</p>` : 
            `<p>⚠️ Unfortunately, your registration has been rejected. Please contact support for more details.</p>`}
        <br>
        <p>Best Regards,</p>
        <p>HomeCareOg Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation Send to ${email}`);
    return true;
  } catch (error) {

    if (error instanceof Error) {
      if (
        error.message.includes("getaddrinfo ENOTFOUND") ||
        error.message.includes("connect ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      ) {
        console.error("Error: Internet connection required to send email.");
      } else {
        console.error("Error sending OTP email:", error.message);
      }
    } else {
      console.error("Unknown error occurred while sending email");
    }
    return false;
  }
}


export default sendEmail;
export { sendDoctorEmail }
