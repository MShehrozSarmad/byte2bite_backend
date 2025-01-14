import twilio from "twilio";
import { ApiError } from "../utils/apiError.js";

const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = async (phoneNumber, otp) => {
    try {
        const res = await client.messages.create({
            body: `Your OTP is for Byte2Byte is: ${otp}`,
            from: process.env.TWILIO_PHONE_NO,
            to: phoneNumber,
        });
        return res;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new ApiError(503, "Failed to send OTP");
    }
};

export { sendSMS };
