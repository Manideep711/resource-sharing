import Resource from "../models/Resource.js";

/**
 * @desc Create a new resource (blood or food)
 * @route POST /api/resources
 * @access Donor only
 */
export const createResource = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can create resources." });
    }

    const { resourceType, bloodType, quantity, description, address, expiresAt } = req.body;

    if (!resourceType || !quantity || !address) {
      return res
        .status(400)
        .json({ message: "Resource type, quantity, and address are required." });
    }

    if (resourceType === "blood" && !bloodType) {
      return res.status(400).json({ message: "Blood type is required for blood donations." });
    }

    const newResource = await Resource.create({
      user: user._id,
      resourceType,
      bloodType: resourceType === "blood" ? bloodType : null,
      quantity,
      description: description || "",
      address,
      status: "available",
      expiresAt: expiresAt || null,
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
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Optional: Ensure only the resource owner or an authorized requester can view
    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this resource" });
    }

    res.status(200).json(resource);
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
 * @desc Update a resource
 * @route PATCH /api/resources/:id
 * @access Donor only
 */
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updates = req.body;

    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this resource" });
    }

    const updated = await Resource.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Resource updated successfully", resource: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete a resource
 * @route DELETE /api/resources/:id
 * @access Donor only
 */
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this resource" });
    }

    await Resource.findByIdAndDelete(id);
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all resources (admin/debug use)
 * @route GET /api/resources
 * @access Private
 */
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * @desc Update resource status
 * @route PATCH /api/resources/:id/status
 * @access Donor only
 */
export const updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (resource.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this resource" });
    }

    resource.status = status;
    await resource.save();

    res.status(200).json({ message: "Status updated successfully", resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
