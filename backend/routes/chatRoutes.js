import express from "express";
import { createOrGetChat, sendMessage, getUserChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrGetChat);
router.post("/message", protect, sendMessage);
router.get("/", protect, getUserChats);

export default router;
