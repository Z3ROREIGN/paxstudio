import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Code, Zap, Shield, Users, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">PaxStudio</h1>
          </div>
          <Button
            onClick={() => setLocation("/auth")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Professional Code Support Service
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Submit your code, get it fixed by expert developers. Fast, reliable, and affordable support for all your coding needs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            onClick={() => setLocation("/auth")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Start Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-6 text-lg"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <p className="text-3xl font-bold text-blue-400 mb-2">1000+</p>
            <p className="text-slate-400">Projects Fixed</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <p className="text-3xl font-bold text-green-400 mb-2">24/7</p>
            <p className="text-slate-400">Support Available</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <p className="text-3xl font-bold text-purple-400 mb-2">98%</p>
            <p className="text-slate-400">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Why Choose PaxStudio?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
            <p className="text-slate-400 text-sm">
              Get your code fixed in minutes, not days
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Secure & Private</h4>
            <p className="text-slate-400 text-sm">
              Your code is encrypted and protected
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Expert Team</h4>
            <p className="text-slate-400 text-sm">
              Professional developers with years of experience
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <Code className="w-8 h-8 text-purple-400 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Real-time Chat</h4>
            <p className="text-slate-400 text-sm">
              Communicate directly with your support team
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">How It Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 mx-auto">
              1
            </div>
            <h4 className="text-lg font-semibold text-white text-center mb-2">Upload</h4>
            <p className="text-slate-400 text-sm text-center">
              Upload your .ZIP file with your code
            </p>
            {/* Arrow */}
            <div className="hidden md:block absolute top-6 -right-3 w-6 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 mx-auto">
              2
            </div>
            <h4 className="text-lg font-semibold text-white text-center mb-2">Pay</h4>
            <p className="text-slate-400 text-sm text-center">
              Secure payment via MisticPay
            </p>
            {/* Arrow */}
            <div className="hidden md:block absolute top-6 -right-3 w-6 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 mx-auto">
              3
            </div>
            <h4 className="text-lg font-semibold text-white text-center mb-2">Chat</h4>
            <p className="text-slate-400 text-sm text-center">
              Communicate with support in real-time
            </p>
            {/* Arrow */}
            <div className="hidden md:block absolute top-6 -right-3 w-6 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white text-center mb-2">Receive</h4>
            <p className="text-slate-400 text-sm text-center">
              Get your fixed code delivered
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Simple Pricing</h3>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-400 text-sm mb-2">Files under 1 MB</p>
              <p className="text-4xl font-bold text-white">R$ 3,50</p>
              <p className="text-slate-400 text-xs mt-2">Fixed price</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Files over 1 MB</p>
              <p className="text-4xl font-bold text-white">R$ 1,00</p>
              <p className="text-slate-400 text-xs mt-2">Per MB</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">Ready to get started?</h3>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who trust PaxStudio for professional code support
        </p>
        <Button
          onClick={() => setLocation("/auth")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
        >
          Sign Up Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 PaxStudio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
