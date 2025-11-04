import express from "express";
import {
  createResource,
  getMyResources,
  getNearbyResources,
  deleteResource,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResource);
router.get("/my", protect, getMyResources);
router.get("/nearby", protect, getNearbyResources);
router.delete("/:id", protect, deleteResource);

export default router;
