import { useState, useRef, useEffect } from "react";

interface Message {
  sender: string;
  content: string;
}

const App = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinRoom = () => {
    socket.current = new WebSocket("wss://chat-app-9u11.onrender.com/");
    socket.current.onopen = () => {
      socket.current?.send(JSON.stringify({ type: "join", roomId }));
      setIsJoined(true);
    };

    socket.current.onmessage = (event) => {
      const { sender, msg } = JSON.parse(event.data);
      setMessages((prev) => [...prev, { sender, content: msg }]);
    };
  };

  const handleDisconnect = () => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
      setMessages([]);
      setIsJoined(false);
    }
  };

  const sendMessage = () => {
    if (socket.current) {
      socket.current.send(JSON.stringify({ type: "chat", msg: newMessage }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-200">
      {!isJoined ? (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-slate-200 text-white text-center px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to ChatSphere 🗨️</h1>
            <p className="text-lg md:text-xl mb-8">
              Create & Join a room and start chatting in real-time using just a Room ID.
            </p>
            <div className="w-full max-w-md bg-white p-2 rounded-lg ml-20 shadow">
              <h2 className="text-xl font-bold mt-2">Join a Room</h2>
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 border rounded mb-4 text-black"
              />
              <button
                onClick={joinRoom}
                disabled={!roomId.trim()}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white p-4 rounded-lg shadow bg-gradient-to-br from-slate-200 to-blue-400">
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Room: {roomId}</h2>
            <button
              onClick={handleDisconnect}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Leave
            </button>
          </header>
          <div className="h-96 overflow-y-auto bg-gray-300 p-4 rounded mb-4 scrollbar-hide">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${msg.sender === "You"
                  ? "bg-green-400 text-black text-right ml-60"
                  : "bg-white text-black text-left mr-40"
                  }`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <footer className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              Send
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
