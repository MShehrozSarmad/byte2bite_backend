import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, unique: true },
        password: { type: String, required: [true, "password is required"] },
        role: {
            type: String,
            enum: ["pending", "contributor", "ngo", "admin"],
            default: "pending",
        },
        refreshToken: {
            type: String,
            // required: true,
        },

        details: {
            basicInfo: {
                name: { type: String },
                profilePicture: { type: String },
                contact: { type: String },
                alternateContact: { type: String },
                isVerified: { type: Boolean, default: false },
            },
            address: {
                country: { type: String },
                state: { type: String },
                city: { type: String },
                zipCode: { type: String },
                fullAddress: { type: String },
                coordinates: {
                    latitude: { type: Number },
                    longitude: { type: Number },
                },
            },
            additionalDetails: {
                description: { type: String },
            },

            // Contributor-specific fields
            contributorSpecific: {
                contributedFoodItems: [
                    { type: Schema.Types.ObjectId, ref: "FoodItem" },
                ],
                donations: [
                    { type: Schema.Types.ObjectId, ref: "Contribution" },
                ],
            },

            // NGO-specific fields
            ngoSpecific: {
                ngoDetails: {
                    registrationNumber: { type: String },
                    ntnNumber: { type: String },
                    certificateURL: { type: String },
                },
                managedDonations: [
                    { type: Schema.Types.ObjectId, ref: "Contribution" },
                ],
            },
        },
    },
    { timestamps: true }
);

// password encryption
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// password validation
userSchema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.genAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};
userSchema.methods.genRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = model("User", userSchema);
