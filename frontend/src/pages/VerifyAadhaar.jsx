import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function VerifyAadhaar() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleVerify = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      let retries = 1;
      let data = null;

      while (retries >= 0) {
        const res = await fetch("http://127.0.0.1:8000/ocr/extract", {
          method: "POST",
          body: formData,
        });

        data = await res.json();
        const isRateLimit =
          res.status === 429 ||
          data?.error === "RATE_LIMIT" ||
          data?.error_type === "RATE_LIMIT";

        if (isRateLimit && retries > 0) {
          window.alert("API limit exceeded. Please wait and retry.");
          await sleep((data?.retry_after_seconds || 20) * 1000);
          retries -= 1;
          continue;
        }

        break;
      }

      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-xl py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield /> Aadhaar Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <Button onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify Aadhaar"}
            </Button>

            {result && (
              <div className="border rounded p-4 text-center space-y-2">
                <p>
                  <b>Aadhaar:</b> **** **** {result.id_number?.slice(-4)}
                </p>

                {result.final_status === "AUTHENTIC" ? (
                  <div className="text-green-600 font-bold flex justify-center gap-2">
                    <CheckCircle /> AUTHENTIC
                  </div>
                ) : (
                  <div className="text-red-600 font-bold flex justify-center gap-2">
                    <XCircle /> FAILED
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
