import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import graduationImage from "@/assets/graduation-digital.jpg";

export default function AdminLogin() {
  const [adminCode, setAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000";

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!adminCode.trim()) {
        throw new Error("Admin code is required");
      }

      const response = await fetch(`${API_BASE_URL}/api/users/admin/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminCode }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Store admin token
        if (data.token) {
          localStorage.setItem("adminToken", data.token);
        }

        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin dashboard",
        });

        navigate("/admin/dashboard");
      } else {
        throw new Error(data.message || "Invalid admin code");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={graduationImage}
          alt="Admin Access"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Doc Verify</h1>
                <p className="text-white/80">Admin Panel</p>
              </div>
            </div>

            <h2 className="text-4xl font-display font-bold mb-6">
              Admin Access Control
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Manage user registrations, approve pending accounts, and maintain system security.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-success" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-success" />
                <span>User Verification Control</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-success" />
                <span>Access Logs & Audit Trail</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <Card className="border-primary/20 shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display">
                Admin Access
              </CardTitle>
              <p className="text-muted-foreground">
                Enter the secure admin code to access the management dashboard
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Secret Admin Code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminCode"
                      type="password"
                      placeholder="Enter secret code"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-base py-6"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Verifying..." : "Enter Admin Panel"}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
                <p className="font-medium">🔐 Admin Access Only</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            {" "} • {" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
