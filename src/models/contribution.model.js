import { Schema, model } from "mongoose";

const contributionSchema = new Schema(
    {
        foodItems: [
            { type: Schema.Types.ObjectId, ref: "FoodItem", required: true },
        ],
        contributor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ngo: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "collecting",
                "collected",
                "distributing",
                "donated",
            ],
            default: "pending",
        },
        pickupTime: { type: Date },
        trackingInfo: {
            currentLocation: {
                latitude: { type: Number },
                longitude: { type: Number },
            },
            lastUpdated: { type: Date },
        },
        history: [
            {
                status: { type: String }, // The status of the donation (e.g., 'pending', 'accepted')
                timestamp: { type: Date, default: Date.now }, // The time when the status was updated
            },
        ],
    },
    { timestamps: true }
);

// // Middleware to update history on status change
contributionSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        this.history.push({ status: this.status });
    }
    next();
});

export const Contribution = model("Contribution", contributionSchema);

// Example usage:
// const contribution = await Contribution.findById(donationId);

// // Change status from 'pending' to 'accepted'
// contribution.status = 'accepted';

// // Add a record in the history array
// contribution.history.push({
//   status: 'accepted',
//   timestamp: new Date(),
// });

// // Save the updated donation
// await contribution.save();
