import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

    // check for profile picture
    // const pf = req.file?.profilePicture[0]?.path;
    // console.log(pf);
    // if(!pf) throw new ApiError( 404, "Profile picture is required");
    // upload to cloudinary

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
    // get refresh token from cookies
    const user = req.user;
    const incomingRefreshToken = req.incomingRefreshToken;

    if (incomingRefreshToken !== user.refreshToken)
        throw new ApiError(401, "Invalid or expired refresh token");

    // generate new access token
    const { accessToken, refreshToken } = await genAccessAndRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
