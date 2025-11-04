import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    resourceType: { 
      type: String, 
      enum: ["blood", "food"], 
      required: true 
    },
    bloodType: { 
      type: String, 
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null 
    },
    quantity: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    address: { 
      type: String, 
      required: true 
    },
    expires_at: {  // ✅ consistent naming with backend & frontend
      type: Date, 
      default: null 
    },
    status: { 
      type: String, 
      enum: ["available", "pending", "completed", "cancelled"], 
      default: "available" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
