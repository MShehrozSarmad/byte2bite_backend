import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g., 'request', 'statusUpdate'
    contribution: { type: Schema.Types.ObjectId, ref: "Contribution" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);