import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft } from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Resources = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [resourceType, setResourceType] = useState<"blood" | "food">("blood");
  const [bloodType, setBloodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Check user login (JWT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in before posting a resource.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!quantity || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/resources/${id}`
        : "http://localhost:5000/api/resources";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resourceType,
          bloodType: resourceType === "blood" ? bloodType : null,
          quantity,
          description,
          address,
          expiresAt: resourceType === "food" ? expiresAt : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resource");

      toast({
        title: isEditMode ? "Resource updated!" : "Resource created!",
        description: isEditMode
          ? "Your resource details have been updated successfully."
          : "Your resource has been posted successfully.",
      });

      navigate("/dashboard");
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

  useEffect(() => {
    if (isEditMode) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      setLoading(true);
      fetch(`http://localhost:5000/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to load resource");
          }
          return res.json();
        })
        .then((data) => {
          setResourceType(data.resourceType || "blood");
          setBloodType(data.bloodType || "");
          setQuantity(data.quantity || "");
          setDescription(data.description || "");
          setAddress(data.address || "");
          setExpiresAt(data.expiresAt ? data.expiresAt.split("T")[0] : "");
        })
        .catch((err: any) => {
          toast({
            title: "Error loading resource",
            description: err.message,
            variant: "destructive",
          });
          navigate("/dashboard");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Resource" : "Create Resource"}</h1>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-medium">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Resource" : "Post a New Resource"}</CardTitle>
            <CardDescription>
              Share blood donations or surplus food to help your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Type */}
              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type *</Label>
                <Select
                  value={resourceType}
                  onValueChange={(value: "blood" | "food") => setResourceType(value)}
                  required
                >
                  <SelectTrigger id="resource-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">Blood Donation</SelectItem>
                    <SelectItem value="food">Food Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Type */}
              {resourceType === "blood" && (
                <div className="space-y-2">
                  <Label htmlFor="blood-type">Blood Type *</Label>
                  <Select value={bloodType} onValueChange={setBloodType} required>
                    <SelectTrigger id="blood-type">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="text"
                  placeholder={
                    resourceType === "blood"
                      ? "e.g., 1 unit, 500ml"
                      : "e.g., 10 meals, 5kg rice"
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the resource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Pickup Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Full address for pickup"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Expiry (for food only) */}
              {resourceType === "food" && (
                <div className="space-y-2">
                  <Label htmlFor="expires">Expiry Date (Optional)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : isEditMode ? "Update Resource" : "Create Resource"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;