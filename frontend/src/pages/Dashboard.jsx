import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import kscstLogo from "@/assets/image.png";
import teamPhoto from "@/assets/pic.jpeg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileSearch,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Shield,
  Upload,
  BarChart3,
  Zap,
  Scan,
} from "lucide-react";

// Interface for verification data from API

// Get user info from localStorage (set during login)
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("userInfo");
    if (userStr) return JSON.parse(userStr);
  } catch {}
  return null;
};

export default function Dashboard() {
  const [user, setUser] = useState(
    getUserFromStorage()
  );
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);
  const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  // Static stats data
  const stats = [
    {
      label: "Today's Verifications",
      value: 24,
      change: "+12%",
      icon: FileSearch,
    },
    {
      label: "Success Rate",
      value: 94,
      suffix: "%",
      change: "+2%",
      icon: CheckCircle,
    },
    {
      label: "Avg. Processing Time",
      value: 28,
      suffix: "s",
      change: "-15%",
      icon: Clock,
    },
    { label: "Flagged Documents", value: 3, change: "-1", icon: AlertTriangle },
  ];

  // Function to fetch recent verifications
  const fetchRecentVerifications = async () => {
    setIsLoadingVerifications(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setRecentVerifications([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/results`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentVerifications(data.data);
        }
      } else {
        console.error("Failed to fetch recent verifications");
        setRecentVerifications([]);
      }
    } catch (error) {
      console.error("Error fetching recent verifications:", error);
      setRecentVerifications([]);
    } finally {
      setIsLoadingVerifications(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUser = async () => {
      try {
        // Get token from localStorage (where your login stores it)
        const token = localStorage.getItem("authToken");

        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.data);
          }
        } else {
          // If unauthorized, clear the invalid token
          localStorage.removeItem("authToken");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      }
    };

    fetchUser();
    fetchRecentVerifications(); // Fetch recent verifications on component mount
  }, []);

  const handleDocUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDoc(file);
    }
  };

  const generateExtractedData = async () => {
    if (!uploadedDoc) return;
    try {
      const formData = new FormData();
      formData.append("file", uploadedDoc);
      const response = await fetch(
        "https://hackodisha-ocr-api.onrender.com/extract/",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("OCR API error");
      const ocrResult = await response.json();
      setExtractedData(ocrResult);
    } catch (error) {
      console.error("OCR extraction failed:", error);
      setExtractedData(null);
    }
  };
  // Send uploaded file to verification API
  const sendFileToVerificationAPI = async () => {
    if (!uploadedDoc) return;
    const formData = new FormData();
    formData.append("file", uploadedDoc);
    try {
      const response = await fetch(
        "/api/forge/predict",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("Verification API result:", result);
    } catch (error) {
      console.error("Error sending file to verification API:", error);
    }
  };

  const verifyDocument = async () => {
    if (!extractedData) return;

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setVerificationResult({
      status: "valid",
      confidence: 97,
      timestamp: new Date().toLocaleString(),
    });
  };

  // Mock user data for display while real user data loads
  const mockUser = {
    name: user?.name || "Loading...",
    role: "verifier",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-glass to-primary/5">
      <Navbar />
      <div className="container py-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Dashboard</p>
              <h1 className="text-5xl font-bold text-foreground mb-2">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="text-lg text-muted-foreground">
                Track and manage your document verification activity
              </p>
            </div>
          </div>

          <Card className="border-success/30 bg-gradient-to-r from-success/10 via-primary/5 to-transparent hover:border-success/50 transition-all">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/20 rounded-lg border border-success/30">
                    <img
                      src={teamPhoto}
                      alt="Team photo"
                      className="h-12 w-12 object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-success font-bold uppercase tracking-wide">🇮🇳 Government Approved</p>
                      <Badge className="bg-success/20 text-success hover:bg-success/30 border-0 h-5">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">KSCST Certified System</h2>
                    <p className="text-xs text-muted-foreground mt-1">Karnataka Government Science & Technology Department</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center space-x-2 text-sm text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="font-semibold">All systems operational</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Official registration verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 hover-lift bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                  <FileSearch className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  New Verification
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Upload and analyze a new certificate document
                </p>
                <Link to="/verify" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
                    <Upload className="h-4 w-4 mr-2" />
                    Start Verification
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover-lift bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-5">
                  <History className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  View History
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Review your verification records and results
                </p>
                <Button
                  variant="outline"
                  className="w-full border-accent/30 hover:bg-accent/10 font-semibold h-11"
                  onClick={() => setShowAllHistoryModal(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Browse History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Cards */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Key Metrics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-primary/15 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <span className={`text-xs font-semibold ${stat.change?.startsWith('+') ? 'text-success' : 'text-accent'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}{stat.suffix || ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-lg">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <span>Recent Verifications</span>
                  </CardTitle>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Last 5</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingVerifications ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-muted-foreground">
                      Loading verifications...
                    </div>
                  </div>
                ) : recentVerifications.length > 0 ? (
                  recentVerifications
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((verification, idx) => (
                      <div
                        key={verification._id}
                        className="flex items-start justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{verification.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{verification.institution}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <div className="text-right">
                            <Badge className="bg-success/20 text-success hover:bg-success/30 border-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(verification.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No verifications yet</p>
                    </div>
                  </div>
                )}
                <Dialog
                  open={showAllHistoryModal}
                  onOpenChange={setShowAllHistoryModal}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full">
                      View All History
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5" />
                        <span>All Verification History</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {isLoadingVerifications ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-sm text-muted-foreground">
                            Loading all verifications...
                          </div>
                        </div>
                      ) : recentVerifications.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {recentVerifications
                            .slice()
                            .reverse()
                            .map((verification, index) => (
                              <div
                                key={verification._id}
                                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {verification.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {verification.institution}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(verification.date)}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-4">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Processed
                                </Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                              No verification history found.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Statistics Chart */}
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-lg">
                    <div className="p-2 bg-primary/15 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <span>Verification Trends</span>
                  </CardTitle>
                  <span className="text-xs font-semibold text-muted-foreground">Last 7 days</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { day: "Mon", value: 18, max: 24 },
                    { day: "Tue", value: 22, max: 24 },
                    { day: "Wed", value: 19, max: 24 },
                    { day: "Thu", value: 24, max: 24 },
                    { day: "Fri", value: 20, max: 24 },
                    { day: "Sat", value: 15, max: 24 },
                    { day: "Sun", value: 10, max: 24 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{item.day}</span>
                        <span className="text-sm font-bold text-foreground">{item.value}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                          style={{ width: `${(item.value / item.max) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-foreground">128</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg/Day</p>
                        <p className="text-xl font-bold text-foreground">18</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-xl font-bold text-success">94%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="border-primary/20 bg-gradient-to-br from-success/5 to-primary/5">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <span>System Status</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-success">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="font-semibold">Healthy</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-card rounded-lg border border-success/20 hover:border-success/50 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">OCR Engine</p>
                      <p className="text-xs text-success font-medium mt-1">● Operational</p>
                      <p className="text-xs text-muted-foreground mt-1">Response: 120ms</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-card rounded-lg border border-primary/20 hover:border-primary/50 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Registry Access</p>
                      <p className="text-xs text-success font-medium mt-1">● Connected</p>
                      <p className="text-xs text-muted-foreground mt-1">99.9% Uptime</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-card rounded-lg border border-accent/20 hover:border-accent/50 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">API Services</p>
                      <p className="text-xs text-success font-medium mt-1">● Active</p>
                      <p className="text-xs text-muted-foreground mt-1">3/3 Services Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
