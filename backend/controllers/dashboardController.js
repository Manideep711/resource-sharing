// controllers/dashboardController.js
import User from "../models/User.js";
import Resource from "../models/Resource.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = {
      full_name: user.fullName,
      phone: user.phone || "",
      blood_type: user.bloodType || "",
      organization_name: user.organizationName || "",
    };

    const myResources =
      user.role === "donor"
        ? await Resource.find({ user: req.user._id }).sort({ createdAt: -1 })
        : [];

    const nearbyResources = await Resource.find({
      user: { $ne: req.user._id },
      status: "available",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      profile,
      myResources,
      nearbyResources,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
