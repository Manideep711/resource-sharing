import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import {jwtDecode} from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

interface DecodedToken {
  id: string;
  email: string;
}

interface Message {
  sender?: { _id: string; full_name?: string; email?: string; isVerified?: boolean };
  text: string;
  createdAt: string;
}

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Decode token once to get user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserId(decoded.id);
    }
  }, []);

  // ✅ Fetch chat history on mount
  useEffect(() => {
    const fetchChat = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        console.error("Error loading messages:", data.message);
      }
    };
    fetchChat();
  }, [chatId]);

  // ✅ Join socket room + listen for new messages
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  // ✅ Send message (handled by socket)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:5000/api/chats/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, text: input }),
      });
      setInput("");
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      let label = date.toDateString();
      if (date.toDateString() === today.toDateString()) label = "Today";
      else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) label = "Yesterday";
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="max-w-3xl mx-auto mt-10 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Chat</h2>

      <div className="border rounded-2xl shadow-md p-4 h-[80vh] overflow-y-auto bg-white relative">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center mt-10">No messages yet.</p>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center text-sm text-gray-500 my-2">{date}</div>
              {msgs.map((msg, idx) => {
                const isMine = msg.sender?._id === userId;
                return (
                  <div key={idx} className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-3 rounded-2xl max-w-[75%] shadow ${
                        isMine
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <div className="text-sm flex items-center gap-1 font-semibold">
                        {isMine
                          ? "You"
                          : msg.sender?.full_name || msg.sender?.email || "User"}
                        {msg.sender?.isVerified && (
                          <span className="text-green-400 text-xs">✔️</span>
                        )}
                      </div>
                      <div>{msg.text}</div>
                      <div
                        className={`text-[11px] mt-1 text-right font-medium ${
                          isMine ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border-primary"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} className="ml-2 bg-primary">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
