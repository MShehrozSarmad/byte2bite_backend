import nodemailer from "nodemailer";
import { ApiError } from "../utils/apiError.js";

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.NODEMAILER_EMAIL,
//         pass: process.env.NODEMAILER_PASS,
//     },
// });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    debug: true,
});

const sendEmail = async (email, subject, message) => {
    try {
        const res = await transporter.sendMail({
            from: `${process.env.FROM} <${process.env.FROM_EMAIL_ADDRESS}>`,
            to: email,
            subject,
            html: message,
        });
        console.log("email sent", res);
        return res;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(503, "Failed to send email");
    }
};

export { sendEmail };
