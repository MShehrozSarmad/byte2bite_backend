import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

//cloudinary Configuration
cloudinary.config({
    cloud_name: "byte2bite",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file upload on cloundinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            throw new ApiError(400, "Invalid file path provided");

        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("file uploaded successfully", res.url);
        return res;
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            throw new ApiError(400, "Invalid data provided");
        } else if (error.http_code === 403) {
            throw new ApiError(
                403,
                "500 Forbidden: Check your Cloudinary credentials"
            );
        } else {
            console.error("Unexpected error:", error);
            throw new ApiError(502, "server error: failed to upload file");
        }
    } finally {
        fs.unlinkSync(localFilePath);
        console.log("local file deleted");
    }
};

export { uploadOnCloudinary };