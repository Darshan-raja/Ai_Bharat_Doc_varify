import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import graduationImage from "@/assets/graduation-digital.jpg";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workingDomain, setWorkingDomain] = useState("");
  const [organization, setOrganization] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Check your email for the verification code",
        });
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to dashboard...`,
        });

        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // Store user info in localStorage for dashboard display
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          email,
          phoneNumber,
          workingDomain,
          organization,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Registration Successful",
          description: "Account created! Please wait for admin approval before logging in.",
        });

        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setWorkingDomain("");
        setOrganization("");

        // Switch to login tab
        setActiveTab("login");
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={graduationImage}
          alt="Academic Verification"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90" />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Doc Verify</h1>
                <p className="text-white/80">Team AURORAS</p>
              </div>
            </div>

            <h2 className="text-4xl font-display font-bold mb-6">
              Secure Academic Verification
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of institutions and verifiers using the most
              trusted certificate validation platform.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Authorized Platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Professional-Grade Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Upto 99.7% Accuracy Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Form Card */}
          <Card className="border-primary/20 shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display">
                {otpSent ? "Verify Your Identity" : "Welcome Back"}
              </CardTitle>
              <p className="text-muted-foreground">
                {otpSent
                  ? "Enter the OTP sent to your email"
                  : "Sign in to your account or create a new one"}
              </p>
            </CardHeader>

            <CardContent>
              {!otpSent ? (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login">
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Sending OTP..."
                          : "Send Verification Code"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerEmail">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="registerEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="organization">Organization</Label>
                          <Input
                            id="organization"
                            placeholder="Your organization name"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workingDomain">Working Domain</Label>
                          <Input
                            id="workingDomain"
                            placeholder="e.g., example.com"
                            value={workingDomain}
                            onChange={(e) => setWorkingDomain(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter a valid phone number (e.g., +1234567890 or 1234567890)
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                // OTP Verification Form
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetOtpFlow}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                  </div>

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* Additional Links */}
              {!otpSent && (
                <div className="mt-6 text-center text-sm">
                  <Link to="/help" className="text-primary hover:underline">
                    Need help? Contact Support
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Links */}
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
