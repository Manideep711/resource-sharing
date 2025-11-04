import Chat from "../models/Chat.js";

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "full_name email")
      .populate("messages.sender", "full_name")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id;

    if (!text || !chatId) {
      return res.status(400).json({ message: "Missing chatId or text" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Push message
    const newMessage = {
      sender: senderId,
      text,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Populate sender info
    const populatedChat = await Chat.findById(chatId)
      .populate("participants", "full_name email")
      .populate("messages.sender", "full_name");

    // Emit via Socket.IO
    const io = req.app.get("io");
    io.to(chatId).emit("newMessage", populatedChat.messages.at(-1));

    res.status(201).json(populatedChat.messages.at(-1));
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};