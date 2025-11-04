import express from "express";
import {
  createRequest,
  getDonorRequests,
  getMyRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/donor", protect, getDonorRequests);
router.get("/my", protect, getMyRequests);
router.put("/:id", protect, updateRequestStatus);

export default router;
