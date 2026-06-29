import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LogOut,
  Users,
  Ticket,
  Settings,
  Ban,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Ticket {
  id: number;
  clientName: string;
  clientEmail: string;
  fileName: string;
  fileSize: number;
  amount: number;
  status: "pending" | "in_progress" | "completed";
  paymentStatus: "pending" | "completed";
  createdAt: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: Date;
}

export default function AdminPanel() {
  const { user, logout, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Load tickets
  useEffect(() => {
    if (user?.role === "admin") {
      // TODO: Fetch tickets from API
      setTickets([
        {
          id: 1,
          clientName: "João Silva",
          clientEmail: "joao@example.com",
          fileName: "project.zip",
          fileSize: 2048576,
          amount: 2.0,
          status: "in_progress",
          paymentStatus: "completed",
          createdAt: new Date(),
        },
        {
          id: 2,
          clientName: "Maria Santos",
          clientEmail: "maria@example.com",
          fileName: "code-fix.zip",
          fileSize: 512000,
          amount: 3.5,
          status: "completed",
          paymentStatus: "completed",
          createdAt: new Date(Date.now() - 86400000),
        },
      ]);

      // TODO: Fetch users from API
      setUsers([
        {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "user",
          isBanned: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Maria Santos",
          email: "maria@example.com",
          role: "user",
          isBanned: false,
          createdAt: new Date(),
        },
      ]);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const handleBanUser = async (userId: number) => {
    setIsLoading(true);
    try {
      // TODO: Call API to ban user
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTicket = async (ticketId: number) => {
    setIsLoading(true);
    try {
      // TODO: Call API to complete ticket
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: "completed" } : t));
      toast.success("Ticket marked as completed");
    } catch (error) {
      toast.error("Failed to complete ticket");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const filteredTickets = tickets.filter(t =>
    t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Admin</p>
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tickets or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 mb-8">
            <TabsTrigger value="tickets" className="text-slate-300 data-[state=active]:text-white">
              <Ticket className="w-4 h-4 mr-2" />
              Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-slate-300 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 text-center">
                  <p className="text-slate-400">No tickets found</p>
                </Card>
              ) : (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{ticket.clientName}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              ticket.status === "completed"
                                ? "bg-green-500/20 text-green-300"
                                : ticket.status === "in_progress"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {ticket.status === "completed" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {ticket.status === "in_progress" && <Clock className="w-3 h-3 inline mr-1" />}
                            {ticket.status === "pending" && <AlertCircle className="w-3 h-3 inline mr-1" />}
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{ticket.clientEmail}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">File</p>
                            <p className="text-white font-mono text-sm">{ticket.fileName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Size</p>
                            <p className="text-white text-sm">{(ticket.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Amount</p>
                            <p className="text-white text-sm">R$ {ticket.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Payment</p>
                            <p className={`text-sm font-semibold ${ticket.paymentStatus === "completed" ? "text-green-400" : "text-yellow-400"}`}>
                              {ticket.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {ticket.status !== "completed" && (
                          <Button
                            onClick={() => handleCompleteTicket(ticket.id)}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
                        >
                          View Chat
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 text-center">
                  <p className="text-slate-400">No users found</p>
                </Card>
              ) : (
                filteredUsers.map((u) => (
                  <Card key={u.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{u.name}</h3>
                        <p className="text-slate-400 text-sm">{u.email}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Joined: {u.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {u.isBanned && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs font-semibold">
                            <Ban className="w-3 h-3 inline mr-1" />
                            Banned
                          </span>
                        )}
                        <Button
                          onClick={() => handleBanUser(u.id)}
                          disabled={isLoading}
                          variant={u.isBanned ? "outline" : "destructive"}
                          className={u.isBanned ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
