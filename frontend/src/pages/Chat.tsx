import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
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
  sender?: { _id: string; full_name?: string; email?: string };
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

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  // ✅ Send message (do NOT add locally; socket will handle it)
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

  // ✅ Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Format time to "hh:mm AM/PM"
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Optional: Group messages by date (Today, Yesterday, etc.)
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

  <div className="border rounded-2xl shadow-md p-4 h-[75vh] overflow-y-auto bg-gray-50 relative">

        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center mt-10">
            No messages yet.
          </p>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="text-center text-sm text-gray-500 my-2">{date}</div>

              {msgs.map((msg, idx) => {
                const isMine = msg.sender?._id === userId;
                return (
                  <div
                    key={idx}
                    className={`mb-2 flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg max-w-[70%] shadow-sm ${
                        isMine
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <div className="text-sm">
                        <strong>
                          {isMine
                            ? "You"
                            : msg.sender?.full_name ||
                              msg.sender?.email ||
                              "User"}
                        </strong>
                      </div>
                      <div>{msg.text}</div>
                      <div
  className={`text-[10px] mt-1 text-right ${
    isMine ? "text-gray-100" : "text-gray-600"
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
