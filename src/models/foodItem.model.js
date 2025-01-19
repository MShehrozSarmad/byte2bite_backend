import { Schema, model } from "mongoose";

const foodItemSchema = new Schema({
    contributor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["available", "donated", "expired"],
        default: "available",
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
}, {timestamps: true});

export const FoodItem = model("FoodItem", foodItemSchema);
