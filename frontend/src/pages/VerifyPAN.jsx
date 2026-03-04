import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Shield, CheckCircle, XCircle } from "lucide-react";

export default function VerifyPAN() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/extract", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
    
    // Save to user history if authentic/extracted
    if (data.document_type && !data.error) {
      const token = localStorage.getItem("authToken");
      try {
        await fetch("http://localhost:5000/api/users/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: data.Name || "Unknown Name",
            institution: "Government of India (PAN)",
          }),
          credentials: "include",
        });
      } catch (err) {
        console.error("DB store error:", err);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-xl py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield /> PAN Card Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <Button onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify PAN"}
            </Button>

            {result && (
              <div className="border rounded p-4 text-center space-y-2">
                <p><b>Name:</b> {result.Name}</p>
                <p><b>PAN:</b> {result["PAN Number"]}</p>

                {result.final_status === "AUTHENTIC" ? (
                  <div className="text-green-600 font-bold flex justify-center gap-2">
                    <CheckCircle /> AUTHENTIC
                  </div>
                ) : (
                  <div className="text-red-600 font-bold flex justify-center gap-2">
                    <XCircle /> SUSPICIOUS
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
