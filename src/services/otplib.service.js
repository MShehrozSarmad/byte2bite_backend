import { authenticator } from "otplib";

const secret = process.env.OTP_SECRET;
if (!secret) {
    throw new Error("OTP_SECRET is not set in the environment variables");
}

authenticator.options = {
    step: 300,
    window: 1,
};

const generateOTP = () => {
    return authenticator.generate(secret);
};

const verifyGenOTP = (token) => {
    return authenticator.verify({ token, secret });
};

export { generateOTP, verifyGenOTP };
