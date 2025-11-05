import User from "../models/User.js";
import Resource from "../models/Resource.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id; // decoded from JWT
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // User's own resources
    const myResources = await Resource.find({ user: userId });

    // Simple mock nearby filter
    const nearbyResources = await Resource.find({ status: "available" });

    return res.json({
      user: {
        id: user._id,
        role: user.role,
      },
      profile: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,  // ✅ key fix
        verificationDoc: user.verificationDoc,        // ✅ include uploaded file
      },
      myResources,
      nearbyResources,
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};
