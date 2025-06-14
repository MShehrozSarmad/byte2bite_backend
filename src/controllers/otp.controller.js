import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/nodemailer.service.js";
import { generateOTP, verifyGenOTP } from "../services/otplib.service.js";
import { getStoredOtp, storeOtp } from "../utils/redis.js";
import { sendSMS } from "../services/twilio.service.js";
import fs from "fs";
import path from "path";

const getOTP = asyncHandler(async (req, res) => {
    const { method } = req.query;
    // console.log(method, req.body);
    const { email, isVerified } = req.user;
    // console.log(email);
    const phone = req.user.details.basicInfo.contact;
    // console.log(phone);

    console.log("status::", isVerified);
    if (isVerified) throw new ApiError(400, "Acoount is already verified.");

    const otp = generateOTP();
    try {
        if (method === "sms") {
            await sendSMS(phone, otp);
        } else if (method === "email") {
            // const resp = await sendEmail(email, "OTP verification", `Your OTP for Byte2Bite is: ${otp}`);
            // console.log(resp);
            const templatePath = path.join(
                process.cwd(),
                "src",
                "templates",
                "verify_otp.html"
            );
            let html = fs.readFileSync(templatePath, "utf-8");
            html = html.replace(
                /{{name}}/g,
                req.user.details.basicInfo.name || email.split("@")[0]
            );
            html = html.replace(/{{otp}}/g, otp);
            await sendEmail(email, "Account Verification OTP", html);
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
    const { email, isVerified } = req.user;
    const user = req.user;
    // console.log(user);

    if (isVerified) throw new ApiError(400, "Acoount is already verified.");

    // console.log(otp, email);
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new ApiError(400, "Invalid OTP format.");
    }

    const storedOTP = await getStoredOtp(email);
    console.log(storedOTP);

    if (!storedOTP || storedOTP !== otp) {
        throw new ApiError(400, "Invalid or expired OTP.");
    }

    const isValid = verifyGenOTP(otp);
    // console.log(isValid);

    if (!isValid) throw new ApiError(400, "Invalid or expired OTP .");

    user.isVerified = isValid;
    user.save();
    // console.log(user.isVerified);

    const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "account_verified.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace(
        /{{name}}/g,
        user.details.basicInfo.name || email.split("@")[0]
    );
    await sendEmail(email, "Account Verified", html);

    res.status(200).json(
        new ApiResponse(200, isValid, "OTP verified successfully.")
    );
});

export { getOTP, verifyOTP };
