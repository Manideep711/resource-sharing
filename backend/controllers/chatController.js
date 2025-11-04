import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Create or get existing chat between donor & requester
export const createOrGetChat = async (req, res) => {
  const { donorId, requesterId } = req.body;

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [donorId, requesterId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [donorId, requesterId] });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, text } = req.body;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ sender: userId, text });
    await chat.save();

    // For real-time send via socket (we’ll add next)
    req.io.to(chatId).emit("newMessage", { chatId, sender: userId, text });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user’s chats
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    }).populate("participants", "fullName email role");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
