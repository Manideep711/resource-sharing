import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.emit("joinChat", chatId);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/chats/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chatId, text: input }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    }

    setInput("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-white">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center mt-10">
            No messages yet.
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <strong>{msg.sender?.full_name || "You"}:</strong>{" "}
              <span>{msg.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border-primary"
        />
        <Button onClick={sendMessage} className="ml-2 bg-primary">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
