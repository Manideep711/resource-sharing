import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowLeft } from "lucide-react";

const VerifyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(uploadedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPG, or PNG files are allowed.",
          variant: "destructive",
        });
        return;
      }
      setFile(uploadedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a verification document before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch("http://localhost:5000/api/verify/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
  toast({
    title: "Uploaded successfully",
    description: "Your document is under review.",
  });

  // ✅ Cache local pending state
  localStorage.setItem("verificationStatus", "pending");

  // ✅ Give backend a short moment to finish DB write
  setTimeout(() => navigate("/dashboard"), 1000);
}
 else {
        toast({
          title: "Upload failed",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex flex-col items-center justify-center relative">
      {/* ✅ Optional upload overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="font-medium">Uploading your document...</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md shadow-lg relative">
        <CardHeader className="flex flex-col gap-2 items-center relative">
          <ArrowLeft
            className="absolute left-4 top-4 cursor-pointer text-gray-500 hover:text-black"
            onClick={() => navigate("/dashboard")}
          />
          <Upload className="h-12 w-12 text-primary" />
          <CardTitle>Upload Verification Document</CardTitle>
          <CardDescription>
            Upload a valid ID, organization proof, or certificate for admin
            verification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />

            {file && (
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white"
            >
              {loading ? "Uploading..." : "Submit for Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPage;
