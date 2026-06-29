import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { Send, Paperclip, Image, Download, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  message: string;
  type: "text" | "image" | "file";
  filePath?: string;
  fileName?: string;
  timestamp: Date;
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/chat/:ticketId");
  const ticketId = params?.ticketId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat messages
  useEffect(() => {
    if (ticketId && user) {
      // TODO: Fetch chat messages from API
      // For now, add a welcome message
      setMessages([
        {
          id: 1,
          userId: 2,
          userName: "Support Team",
          message: "Hello! Thank you for choosing PaxStudio. Our team will review your code shortly.",
          type: "text",
          timestamp: new Date(),
        },
      ]);
    }
  }, [ticketId, user]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;

    setIsLoading(true);

    try {
      // TODO: Send message to API
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        userId: user?.id || 0,
        userName: user?.name || "User",
        message: messageInput,
        type: selectedFile ? "file" : "text",
        fileName: selectedFile?.name,
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setMessageInput("");
      setSelectedFile(null);
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="ghost"
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Support Chat</h1>
            <p className="text-slate-400 text-sm">Ticket #{ticketId}</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.userId === user?.id
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-700 text-slate-100 rounded-bl-none"
                }`}
              >
                {msg.userId !== user?.id && (
                  <p className="text-xs font-semibold mb-1 opacity-75">{msg.userName}</p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                {msg.fileName && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Paperclip className="w-3 h-3" />
                    <span>{msg.fileName}</span>
                  </div>
                )}
                <p className="text-xs opacity-50 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-slate-700/30 border border-slate-600 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">{selectedFile.name}</span>
              </div>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 flex-1"
            />

            {/* File Upload Buttons */}
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept=".zip,.jpg,.jpeg,.png,.gif"
            />

            <Button
              onClick={() => document.getElementById("file-input")?.click()}
              variant="outline"
              size="icon"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!messageInput.trim() && !selectedFile)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
