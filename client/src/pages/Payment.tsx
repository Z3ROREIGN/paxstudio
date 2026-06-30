import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CreditCard, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Payment() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:ticketId");
  const ticketId = params?.ticketId ? parseInt(params.ticketId, 10) : null;

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  // Fetch ticket data from API
  const { data: ticketData, isLoading: ticketLoading, error: ticketError } = trpc.tickets.get.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId && !!user }
  );

  const initiatePaymentMutation = trpc.tickets.initiatePayment.useMutation();
  const confirmPaymentMutation = trpc.tickets.confirmPayment.useMutation();

  const handlePayment = async () => {
    if (!ticketId || !ticketData) return;

    setIsLoading(true);
    setPaymentStatus("processing");

    try {
      // Initiate payment via MisticPay
      const payment = await initiatePaymentMutation.mutateAsync({ ticketId });

      // If a payment URL is returned, redirect to it
      if (payment.paymentUrl && payment.paymentUrl.startsWith("http")) {
        window.location.href = payment.paymentUrl;
        return;
      }

      // Otherwise confirm payment directly (for mock/test mode)
      await confirmPaymentMutation.mutateAsync({
        ticketId,
        paymentId: payment.paymentId,
      });

      setPaymentStatus("completed");
      toast.success("Payment successful! Your support chat is now active.");

      // Redirect to chat after 2 seconds
      setTimeout(() => {
        setLocation(`/chat/${ticketId}`);
      }, 2000);
    } catch (error: any) {
      setPaymentStatus("failed");
      toast.error(error?.message || "Payment failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (ticketLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (ticketError || !ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-semibold mb-2">Ticket not found</p>
          <p className="text-slate-400 mb-4">The ticket you are looking for does not exist or you do not have access.</p>
          <Button onClick={() => setLocation("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const amount = parseFloat(ticketData.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
          <h1 className="text-2xl font-bold text-white">Payment</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h2>
          <p className="text-slate-400">Secure payment processing via MisticPay</p>
        </div>

        {/* Order Summary */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm mb-8 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700">
              <div>
                <p className="text-white font-medium">{ticketData.fileName}</p>
                <p className="text-slate-400 text-sm">
                  File size: {(ticketData.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <p className="text-white font-semibold">R$ {amount.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-white font-semibold">Total</p>
              <p className="text-2xl font-bold text-blue-400">R$ {amount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm mb-8 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Payment Method
          </h3>

          <div className="space-y-4">
            <p className="text-slate-400 text-sm">
              This payment will be processed through MisticPay, a secure payment gateway. Your payment information is encrypted and secure.
            </p>

            {/* Payment Status */}
            {paymentStatus === "pending" && (
              <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                <p className="text-slate-300 text-sm">Ready to process payment</p>
              </div>
            )}

            {paymentStatus === "processing" && (
              <div className="p-4 bg-blue-500/10 border border-blue-600 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <p className="text-blue-300 text-sm">Processing payment...</p>
              </div>
            )}

            {paymentStatus === "completed" && (
              <div className="p-4 bg-green-500/10 border border-green-600 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-green-300 text-sm">Payment successful! Redirecting to chat...</p>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="p-4 bg-red-500/10 border border-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-300 text-sm">Payment failed. Please try again.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Button */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={isLoading || paymentStatus === "completed" || ticketData.paymentStatus === "confirmed"}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {ticketData.paymentStatus === "confirmed"
              ? "Payment Already Confirmed"
              : paymentStatus === "completed"
              ? "Payment Complete"
              : isLoading
              ? "Processing..."
              : `Pay R$ ${amount.toFixed(2)}`}
          </Button>

          {ticketData.paymentStatus === "confirmed" && (
            <Button
              onClick={() => setLocation(`/chat/${ticketId}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Chat
            </Button>
          )}

          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-slate-700/20 border border-slate-600 rounded-lg">
          <p className="text-slate-400 text-xs">
            🔒 Your payment is secure and encrypted. PaxStudio uses MisticPay for secure payment processing. Your payment information is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
