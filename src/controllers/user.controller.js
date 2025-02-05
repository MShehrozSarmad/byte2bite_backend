import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { completeProfileSchema } from "../validators/completeProfile.validator.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { Notification } from "../models/notification.model.js";

const completeProfile = asyncHandler(async (req, res) => {
    console.log(req.body);

    const userId = req.user._id;

    const { error, value } = completeProfileSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    // const updateData = {
    //     role: value.role,
    //     details: {
    //         basicInfo: value.basicInfo,
    //         address: value.address,
    //         additionalDetails: value.additionalDetails,
    //         ngoSpecific: value.ngoSpecific,
    //     },
    // };

    const updatedUser = await User.findByIdAndUpdate(userId, value, {
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

const getProfile = asyncHandler(async (req, res) => {
    const { password, refreshToken, ...filteredUser } = req.user.toObject();
    res.status(200).json(
        new ApiResponse(200, filteredUser, "User profile fetched successfully")
    );
});

const deleteAccount = asyncHandler(async (req, res) => {
    let delUser;
    try {
        delUser = await User.findOneAndDelete(req.user._id).select(
            "-refreshToken -password"
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(503, "error deleting user, try agian");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, delUser, "user deleted successfully"));
});

// const updateProfile = asyncHandler(async (req, res) => {
//     const dataUpdate = req.body;
//     const userId = req.user._id;

//     const { error, value } = completeProfileSchema.validate(dataUpdate);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const user = await User.findByIdAndUpdate(userId, value, {
//         new: true,
//         runValidators: true,
//     }).select("-password -refreshToken");

//     if (!user) throw new ApiError(404, "user not found, something went wrong");

//     res.status(200).json(200, user, "user details updated successfully");
// });

const setProfilePicture = asyncHandler(async (req, res) => {
    const user = req.user;

    // check for profile picture
    const profilePicture = req.file?.path;
    if (!profilePicture) throw new ApiError(400, "Profile picture is required");

    // upload to cloudinary
    const uploadedPic = await uploadOnCloudinary(profilePicture);

    user.details.basicInfo.profilePicture = uploadedPic.url;
    await user.save({ validateBeforeSave: false });

    // console.log(user);
    res.status(200).json(
        new ApiResponse(200, uploadedPic.url, "profile picture uploaded")
    );
});

const uploadCertificate = asyncHandler(async (req, res) => {
    const user = req.user;
    const certificate = req.file?.path;
    if (!certificate) throw new ApiError(400, "certificate file is required");

    const uploadedCrtfct = await uploadOnCloudinary(certificate);
    console.log(uploadedCrtfct);

    user.details.ngoSpecific.ngoDetails.certificateURL = uploadedCrtfct.url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, uploadedCrtfct.url, "certificate uploaded")
    );
});

const getNotifications = asyncHandler(async (req, res) => {
    const user = req.user._id;

    const notifications = await Notification.find({ recipient: user });

    res.status(200).json(
        new ApiResponse(
            200,
            notifications,
            "notifications fetched successfully"
        )
    );
});

export {
    completeProfile,
    getProfile,
    deleteAccount,
    setProfilePicture,
    uploadCertificate,
    getNotifications
};
