import { Schema, model } from "mongoose";

const foodItemSchema = new Schema(
    {
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
            enum: [
                "available", // Available for requests
                "reserved", // Has pending/accepted contribution
                "in_transit", // Being collected/delivered
                "donated", // Successfully donated
                "expired", // Passed expiration
                "cancelled", // Manually cancelled
            ],
            default: "available",
        },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
    },
    { timestamps: true }
);

// models/foodItem.model.js
foodItemSchema.pre('save', function(next) {
    if (this.expirationDate < new Date() && this.status !== 'donated') {
      this.status = 'expired';
    }
    next();
  });

export const FoodItem = model("FoodItem", foodItemSchema);
