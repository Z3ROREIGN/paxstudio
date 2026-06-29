import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Upload, LogOut, FileArchive, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a .ZIP file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a .ZIP file");
      }
    }
  };

  const calculatePrice = () => {
    if (!selectedFile) return 0;
    const sizeInBytes = selectedFile.size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

    if (sizeInMB >= 1) {
      return Math.ceil(sizeInMB) * 1.0; // R$ 1 por MB
    } else {
      return 3.5; // R$ 3,50 fixo para KB
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success("File uploaded successfully! Redirecting to payment...");
      setLocation(`/payment/${data.ticketId}`);
    } catch (error) {
      toast.error("An error occurred during upload");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const price = calculatePrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileArchive className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">PaxStudio</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Welcome</p>
              <p className="text-white font-semibold">{user.name}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Submit Your Code for Support</h2>
          <p className="text-slate-400">Upload your .ZIP file and our team will fix it for you</p>
        </div>

        {/* Upload Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm mb-8 p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-blue-400 bg-blue-500/10"
                : "border-slate-600 bg-slate-700/20 hover:border-slate-500"
            }`}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Drag and drop your .ZIP file</h3>
            <p className="text-slate-400 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                type="button"
                onClick={() => document.getElementById("file-input")?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select File
              </Button>
            </label>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileArchive className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">{selectedFile.name}</p>
                    <p className="text-slate-400 text-sm">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Pricing Info */}
        {selectedFile && (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm mb-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Estimated Cost</p>
                <p className="text-3xl font-bold text-white">
                  R$ {price.toFixed(2)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {selectedFile.size / 1024 / 1024 >= 1
                    ? `R$ 1.00 per MB`
                    : `Fixed price for files under 1 MB`}
                </p>
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                {isUploading ? "Uploading..." : "Proceed to Payment"}
              </Button>
            </div>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
            <Clock className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Fast Support</h3>
            <p className="text-slate-400 text-sm">
              Our team responds quickly to fix your code issues
            </p>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
            <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Quality Guaranteed</h3>
            <p className="text-slate-400 text-sm">
              Professional developers ensure your code works perfectly
            </p>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
            <AlertCircle className="w-6 h-6 text-yellow-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Real-time Chat</h3>
            <p className="text-slate-400 text-sm">
              Communicate with support directly through our chat system
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
