import Resource from "../models/Resource.js";
import User from "../models/User.js";

/**
 * @desc Create a new resource (blood or food)
 * @route POST /api/resources
 * @access Donor only
 */
export const createResource = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Ensure only donors can create resources
    if (user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can create resources." });
    }

    const { resourceType, bloodType, quantity, description, address, expiresAt } = req.body;

    // ✅ Validate required fields
    if (!resourceType || !quantity || !address) {
      return res.status(400).json({ message: "Resource type, quantity, and address are required." });
    }

    if (resourceType === "blood" && !bloodType) {
      return res.status(400).json({ message: "Blood type is required for blood donations." });
    }

    // ✅ Create resource entry
    const newResource = await Resource.create({
      user: user._id,
      resourceType,
      bloodType: resourceType === "blood" ? bloodType : null,
      quantity,
      description: description || "",
      address,
      status: "available",
      expires_at: expiresAt || null,
    });

    res.status(201).json({
      message: "Resource created successfully",
      resource: newResource,
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all resources for the logged-in user
 * @route GET /api/resources/my
 * @access Private
 */
export const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all nearby available resources (excluding user’s own)
 * @route GET /api/resources/nearby
 * @access Private
 */
export const getNearbyResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      user: { $ne: req.user._id },
      status: "available",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete a resource by ID
 * @route DELETE /api/resources/:id
 * @access Donor only
 */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
