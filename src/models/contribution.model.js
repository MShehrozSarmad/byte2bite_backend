import { Schema, model } from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { FoodItem } from "./foodItem.model.js";

const contributionSchema = new Schema(
    {
        foodItem: {
            type: Schema.Types.ObjectId,
            ref: "FoodItem",
            required: true,
        },
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
                "rejected",
                "collecting",
                "collected",
                "distributing",
                "donated",
                "cancelled",
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

contributionSchema.pre("save", function (next) {

    this.history.push({ status: this.status, timestamp: new Date() });
    next();
});

contributionSchema.post("save", async function (doc) {
    const statusMap = {
        // pending: "reserved",
        accepted: "reserved",
        collecting: "in_transit",
        collected: "in_transit",
        distributing: "in_transit",
        donated: "donated",
        cancelled: "available",
    };

    if (statusMap[doc.status]) {
        await FoodItem.findByIdAndUpdate(doc.foodItem, {
            status: statusMap[doc.status],
        });
    }
});

export const Contribution = model("Contribution", contributionSchema);
