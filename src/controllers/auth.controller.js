import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/nodemailer.service.js";
import fs from "fs";
import path from "path";

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

    // Send welcome email
    const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "welcome.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace(/{{name}}/g, email.split("@")[0]);
    html = html.replace(
        /{{profileLink}}/g,
        `${process.env.BASE_URL}/user/profile`
    );
    await sendEmail(email, "Welcome to Byte2Bite!", html);

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
        "-password -refreshToken"
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
                { user: loggedInUser, accessToken, refreshToken },
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
    if (!token)
        throw new ApiError(401, "unauthorized request, token not found");

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

const reqResetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "email or phone is required");

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) throw new ApiError(400, "user not found");

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "600s",
    });

    const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "reset_password.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace(
        /{{name}}/g,
        user.details.basicInfo.name || email.split("@")[0]
    );
    html = html.replace(
        /{{resetLink}}/g,
        `${process.env.RESET_PASSWORD}/${token}`
    );
    await sendEmail(email, "Password Reset Request", html);

    // sendEmail(
    //     email,
    //     "Password Reset Request",
    //     `Click on link to reset your password: ${process.env.BASE_URL}/api/v1/auth/reset-password/${token}`
    // );

    res.status(200).json(
        new ApiResponse(200, null, "email sent for password reset")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    console.log("reset password ------------------------------");

    const { token } = req.params;
    console.log(token);

    const { password } = req.body;
    console.log(password);

    if (!token) throw new ApiError(400, "token is required");

    if (!password) throw new ApiError(400, "new password is required");

    const { email } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(email);

    if (!email) throw new ApiError(400, "Invalid or expired token");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "user not found");

    user.password = password;
    user.save();

    // sendEmail(email, "Password Changed", "Your password changed successfully");

    const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "password_changed.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");
    html = html.replace(
        /{{name}}/g,
        user.details.basicInfo.name || email.split("@")[0]
    );
    await sendEmail(email, "Password Reset Request", html);

    res.status(200).json(new ApiResponse(200, "Password updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    reqResetPassword,
    resetPassword,
};
