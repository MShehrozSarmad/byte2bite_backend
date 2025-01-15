import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/nodemailer.js";
import { generateOTP, verifyGenOTP } from "../utils/otplib.js";
import { getStoredOtp, storeOtp } from "../utils/redis.js";
import { sendSMS } from "../utils/twilio.js";

const getOTP = asyncHandler(async (req, res) => {
    const { method } = req.body;
    // console.log(method, req.body);
    const { email } = req.user;
    // console.log(email);
    const phone = req.user.details.basicInfo.contact;
    // console.log(phone);

    const otp = generateOTP();

    try {
        if (method === "sms") {
            await sendSMS(phone, otp);
        } else if (method === "email") {
            const resp = await sendEmail(email, otp);
            // console.log(resp);
        } else {
            throw new ApiError(400, `invalid method ${method}`);
        }
        await storeOtp(email, otp);
    } catch (err) {
        throw new ApiError(
            503,
            "Failed to process OTP request. Please try again later."
        );
    }

    res.status(200).json(new ApiResponse(200, null, "OTP sent successfully."));
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const { email } = req.user;

    console.log(otp, email);
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new ApiError(400, "Invalid OTP format.");
    }

    const storedOTP = await getStoredOtp(email);
    // console.log(storedOTP);

    if (!storedOTP || storedOTP !== otp) {
        throw new ApiError(400, "Invalid or expired OTP.");
    }

    const isValid = verifyGenOTP(otp);
    // console.log(isValid);

    if (!isValid) throw new ApiError(400, "Invalid or expired OTP .");

    res.status(200).json(
        new ApiResponse(200, isValid, "OTP verified successfully.")
    );
});

export { getOTP, verifyOTP };
