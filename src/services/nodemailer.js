import nodemailer from "nodemailer";
import { ApiError } from "../utils/apiError.js";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
});

const sendEmail = async (email, subject, message) => {
    try {
        const res = await transporter.sendMail({
            from: "Byte2Bite",
            to: email,
            subject,
            text: message,
        });
        console.log("email sent");
        return res;
    } catch (error) {
        console.error("Error sending OTP via email:", error);
        throw new ApiError(503, "Failed to send OTP via email");
    }
};

export { sendEmail };
