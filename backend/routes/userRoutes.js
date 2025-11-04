import express from "express";
import { updateActiveRole } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/role", protect, updateActiveRole);

export default router;
