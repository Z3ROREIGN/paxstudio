import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Send, Paperclip, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/chat/:ticketId");
  const ticketId = params?.ticketId ? parseInt(params.ticketId, 10) : null;

  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  // Fetch messages from API
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = trpc.chat.messages.useQuery(
    { ticketId: ticketId! },
    {
      enabled: !!ticketId && !!user,
      refetchInterval: 5000, // Poll every 5 seconds for new messages
    }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
      setSelectedFile(null);
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !ticketId) return;

    try {
      await sendMessageMutation.mutateAsync({
        ticketId,
        message: messageInput.trim(),
      });
    } catch {
      // Error handled in onError callback
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

  if (messagesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-semibold mb-2">Access Denied</p>
          <p className="text-slate-400 mb-4">
            {messagesError.message || "You do not have access to this chat. Payment may be required."}
          </p>
          <Button onClick={() => setLocation("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Dashboard
          </Button>
        </div>
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
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {(!messages || messages.length === 0) && (
              <div className="text-center py-12">
                <p className="text-slate-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages?.map((msg) => (
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
                    <p className="text-xs font-semibold mb-1 opacity-75">Support Team</p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  {msg.fileName && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Paperclip className="w-3 h-3" />
                      <span>{msg.fileName}</span>
                    </div>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendMessageMutation.isPending}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 flex-1"
            />

            {/* File Upload Button */}
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
              disabled={sendMessageMutation.isPending}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !messageInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
