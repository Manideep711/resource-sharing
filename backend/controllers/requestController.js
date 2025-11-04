import Request from "../models/Request.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";



/**
 * @desc Request a resource
 * @route POST /api/requests
 * @access Requester only
 */
export const createRequest = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const requester = req.user;

    if (requester.role !== "requester") {
      return res.status(403).json({ message: "Only requesters can make requests." });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Prevent duplicate requests for the same resource
    const existingRequest = await Request.findOne({
      requester: requester._id,
      resource: resourceId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingRequest) {
      return res.status(400).json({ message: "You already requested this resource." });
    }

    // Create new request
    const newRequest = await Request.create({
      requester: requester._id,
      donor: resource.user, // donor is the resource owner
      resource: resourceId,
      status: "pending",
    });

    res.status(201).json({
      message: "Request sent successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all requests received by donor
 * @route GET /api/requests/donor
 * @access Donor only
 */
export const getDonorRequests = async (req, res) => {
  try {
    const donor = req.user;

    if (donor.role !== "donor") {
      return res.status(403).json({ message: "Only donors can view received requests." });
    }

    const requests = await Request.find({ donor: donor._id })
      .populate("resource requester", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all requests made by requester
 * @route GET /api/requests/my
 * @access Requester only
 */
export const getMyRequests = async (req, res) => {
  try {
    const requester = req.user;

    const requests = await Request.find({ requester: requester._id })
      .populate("resource donor", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update request status (accept/decline)
 * @route PUT /api/requests/:id
 * @access Donor only
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const donor = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (donor.role !== "donor") {
      return res.status(403).json({ message: "Only donors can update requests." });
    }

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.donor.toString() !== donor._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request." });
    }

    request.status = status;
    await request.save();

    // If accepted, mark resource as unavailable
    if (status === "accepted") {
      await Resource.findByIdAndUpdate(request.resource, { status: "pending" });
    }

    res.json({ message: `Request ${status} successfully.`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ PATCH /api/requests/:id/respond
export const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const donor = req.user;

    const request = await Request.findById(id)
      .populate("requester")
      .populate("resource");

    if (!request) return res.status(404).json({ message: "Request not found" });

    // Ensure donor owns this resource
    if (request.donor.toString() !== donor._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = status;
    await request.save();

    // ✅ If accepted, create a chat if it doesn't exist
    if (status === "accepted") {
      const existingChat = await Chat.findOne({
        participants: { $all: [request.requester._id, donor._id] },
      });

      if (!existingChat) {
        await Chat.create({
          participants: [request.requester._id, donor._id],
          messages: [],
        });
      }
    }

    res.status(200).json({
      message: `Request ${status} successfully.`,
      request,
    });
  } catch (error) {
    console.error("Error in respondToRequest:", error);
    res.status(500).json({ message: error.message });
  }
};