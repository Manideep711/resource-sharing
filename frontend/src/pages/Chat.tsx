import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client"; // ✅ or `import io from "socket.io-client";` if error persists
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const socket = io("http://localhost:5000");

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.emit("joinChat", chatId);
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("newMessage");
    };
  }, [chatId]);

  const sendMessage = () => {
    socket.emit("sendMessage", { chatId, text });
    setText("");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 h-96 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i}>{m.text}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
