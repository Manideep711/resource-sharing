// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    bloodType: { type: String },
    organizationName: { type: String },
    role: {
      type: String,
      enum: ["donor", "requester"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
