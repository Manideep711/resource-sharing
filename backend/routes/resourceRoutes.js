import express from "express";
import {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResource);
router.get("/", protect, getAllResources);
router.patch("/:id", protect, updateResource);
router.delete("/:id", protect, deleteResource);

export default router;
