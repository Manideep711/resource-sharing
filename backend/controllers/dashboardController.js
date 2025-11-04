import User from "../models/User.js";
import Resource from "../models/Resource.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id; // decoded from JWT
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Example: get user's posted resources
    const myResources = await Resource.find({ user: userId });

    // Example: find nearby (simple mock for now)
    const nearbyResources = await Resource.find({ status: "available" });

    return res.json({
      user: {
        id: user._id,
        role: user.role,
      },
      profile: {
        full_name: user.fullName, // ✅ match your schema
        email: user.email,
        phone: user.phone,
      },
      myResources,
      nearbyResources,
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};
