import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { completeProfileSchema } from "../validators/completeProfile.validator.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/nodemailer.js";
import { generateOTP, verifyGenOTP } from "../utils/otplib.js";
import { getStoredOtp, storeOtp } from "../utils/redis.js";
import { sendSMS } from "../utils/twilio.js";

const genAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = await user.genAccessToken();
        const refreshToken = await user.genRefreshToken();
        console.log("Access token inner: ", accessToken);
        console.log("Refresh token inner: ", refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details
    const { email, password } = req.body;
    console.log(req.body);
    console.log(email, password);
    // validate user details
    if (!email || !password)
        throw new ApiError(400, "Email and Password required");

    // user already exists :email based
    const userExisted = await User.findOne({ email });
    console.log(userExisted);
    if (userExisted)
        throw new ApiError(409, "User with same email already exists");

    // create user in db
    const user = await User.create({ email, password });
    console.log(user);

    // check for user creation
    // remove password and refresh token from reponse
    const userCreated = await User.findById(user.id).select(
        "-password -refreshToken -details"
    );
    if (!userCreated) throw new ApiError(500, "Error creating user");

    return res
        .status(200)
        .json(
            new ApiResponse(201, userCreated, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // get data from body
    const { email, password } = req.body;

    // validate data
    if (!email || !password)
        throw new ApiError(400, "Email and Password required");

    // find the user
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "User not found");

    // check password
    const isPswrdValid = await user.isPasswordValid(password);
    if (!isPswrdValid) throw new ApiError(400, "Invalid cridentials");

    // acess and refresh token
    const { accessToken, refreshToken } = await genAccessAndRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user.id).select(
        "-password -details"
    );

    // send cookies
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // get cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // getting token
    const token =
        req.body?.refreshToken ||
        req.cookies?.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "unauthorized request");

    // decoding ref token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        if (err.name == "TokenExpiredError") {
            throw new ApiError(401, "Refresh Token expired, try relogin");
        } else {
            console.log(err);
            throw new ApiError(401, "Something went wrong, please relogin");
        }
    }

    // getting user from token
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(400, "Invalid or tampered refresh roken");

    //checking validity
    if (token !== user.refreshToken)
        throw new ApiError(400, "Invalid or tampered refresh token");

    // generate new access token and set
    const { accessToken, refreshToken } = await genAccessAndRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                "access token refreshed"
            )
        );
});

const completeProfile = asyncHandler(async (req, res) => {
    console.log(req.body);

    const userId = req.user._id;

    const { error, value } = completeProfileSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const updateData = {
        role: value.role,
        details: {
            basicInfo: value.basicInfo,
            address: value.address,
            additionalDetails: value.additionalDetails,
            ngoSpecific: value.ngoSpecific,
        },
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidator: true,
    }).select("-password -refreshToken");
    console.log(updatedUser);

    if (!updateData)
        throw new ApiError(404, "user not found, something went wrong");

    res.status(200).json(
        new ApiResponse(200, updatedUser, "profile updated successfully")
    );
});

const setProfilePicture = asyncHandler(async (req, res) => {
    // check for profile picture
    const profilePicture = req.file?.path;
    if (!profilePicture) throw new ApiError(400, "Profile picture is required");

    // upload to cloudinary
    const uploadedPic = await uploadOnCloudinary(profilePicture);

    const user = req.user;
    user.details.basicInfo.profilePicture = uploadedPic.url;
    user.save({ validateBeforeSave: false });

    console.log(user);
    res.status(200).json(
        new ApiResponse(200, uploadedPic.url, "profile picture uploaded")
    );
});

const getOTP = asyncHandler(async (req, res) => {
    const { method } = req.body;
    console.log(method, req.body);
    const { email } = req.user;
    console.log(email);
    const phone = req.user.details.basicInfo.contact;
    console.log(phone);

    const otp = generateOTP();
    console.log(otp);

    try {
        if (method === "sms") {
            await sendSMS(phone, otp);
        } else if (method === "email") {
            await sendEmail(email, otp);
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
    console.log(storedOTP);

    if (!storedOTP || storedOTP !== otp) {
        throw new ApiError(400, "Invalid or expired OTP.");
    }

    const isValid = verifyGenOTP(otp);
    console.log(isValid);

    if (!isValid) throw new ApiError(400, "Invalid or expired OTP .");

    res.status(200).json(new ApiResponse(200, null, "OTP verified successfully."));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    completeProfile,
    setProfilePicture,
    getOTP,
    verifyOTP,
};
