import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//cloudinary Configuration
cloudinary.config({
    cloud_name: "byte2bite",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// file upload on cloundinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const res = await cloudinary.uploader.upload(localFilePath, {
            public_id: "shoes",
            resource_type: "auto",
        });
        console.log("file uploaded successfully", res.url);
        return res;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};


export {uploadOnCloudinary}