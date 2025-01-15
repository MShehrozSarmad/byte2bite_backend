import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { completeProfileSchema } from "../validators/completeProfile.validator.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { completeProfile, setProfilePicture };
