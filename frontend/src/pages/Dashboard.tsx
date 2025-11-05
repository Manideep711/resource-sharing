import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Leaf,
  AlertCircle,
  LogOut,
  Plus,
  MapPin,
  Clock,
  MessageCircle,
   Pencil,
  Trash,
} from "lucide-react";

type Resource = {
  _id: string;
  resourceType: "blood" | "food";
  bloodType?: string;
  quantity: string;
  description?: string;
  address: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  user: string;
};

type Profile = {
  _id: string;
  fullName: string;
  phone?: string;
  blood_type?: string;
  organization_name?: string;
  email?: string;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [nearbyResources, setNearbyResources] = useState<Resource[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);
useEffect(() => {
  const cachedStatus = localStorage.getItem("verificationStatus");

  // If cached status says "pending", show it immediately
  if (cachedStatus === "pending" && profile) {
    setProfile((prev) => ({
      ...prev!,
      verificationStatus: "pending",
    }));

    // Clear cache once applied so it won't override later
    localStorage.removeItem("verificationStatus");
  }
}, [profile]);


  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        setUserRole(data.user.role);
        setMyResources(data.myResources || []);
        setNearbyResources(data.nearbyResources || []);
      } else {
        toast({
          title: "Error loading dashboard",
          description: data.message,
          variant: "destructive",
        });
      }

      // ✅ fetch chats safely
      const chatRes = await fetch("http://localhost:5000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatData = await chatRes.json();
      setChats(Array.isArray(chatData) ? chatData : []);

      // ✅ fetch requests for donors
      if (data.user.role === "donor") {
        const reqRes = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        setRequests(Array.isArray(reqData) ? reqData : []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleRequestResource = async (resourceId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resourceId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Request Sent!",
          description: "The donor has been notified.",
        });
      } else {
        toast({
          title: "Error sending request",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRequestResponse = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/requests/${requestId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast({
          title: `Request ${status}`,
          description:
            status === "accepted"
              ? "You’ve accepted this request. A chat has been created."
              : "You’ve declined this request.",
        });
        await loadUserData();
      } else {
        toast({
          title: "Error updating request",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (resourceId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/resources/${resourceId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Status Updated",
          description: `Resource marked as ${newStatus}.`,
        });
        await loadUserData();
      } else {
        toast({
          title: "Error updating status",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
 // NEW: navigate to resource edit page
const handleEditResource = (resourceId: string) => {
  navigate(`/resources/${resourceId}`);
};
  // NEW: delete resource with confirmation and refresh
  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Resource Deleted",
          description: "The resource has been removed.",
        });
        await loadUserData();
      } else {
        toast({
          title: "Error deleting resource",
          description: data.message || "Could not delete resource.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getResourceIcon = (type: string) => {
    return type === "blood" ? (
      <Heart className="h-5 w-5 text-primary" />
    ) : (
      <Leaf className="h-5 w-5 text-secondary" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">LifeLink</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{profile?.fullName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-l-4 border-l-primary shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome back, {profile?.fullName || profile?.email}!
            </CardTitle>
            <CardDescription>
              You’re registered as a{" "}
              <Badge variant="secondary" className="ml-2">
                {userRole}
              </Badge>
              {userRole === "donor"
                ? " — You can share blood or food donations."
                : " — You can request available resources near you."}
            </CardDescription>
          </CardHeader>
        </Card>
     {/* ✅ Verification Section */}
{profile && (
  <Card className="mb-8 border-l-4 border-l-blue-500 shadow-soft">
    <CardHeader>
      <CardTitle>Verification Status</CardTitle>
      <CardDescription>
       {(!profile.verificationStatus || profile.verificationStatus === "none") && (
  <div>
    <p>You haven’t submitted verification documents yet.</p>
    <Button
      className="mt-3 bg-blue-600 text-white"
      onClick={() => navigate("/verify")}
    >
      Upload Verification Document
    </Button>
  </div>
)}


        {profile.verificationStatus === "pending" && (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending Review
          </Badge>
        )}

        {profile.verificationStatus === "verified" && (
          <Badge
            variant="default"
            className="bg-green-600 text-white flex items-center gap-1"
          >
            ✅ Verified
          </Badge>
        )}

        {profile.verificationStatus === "rejected" && (
          <div>
            <Badge variant="destructive">Rejected</Badge>
            <p className="text-sm mt-2 text-gray-600">
              Please re-upload valid documents.
            </p>
            <Button
              className="mt-2 bg-blue-600 text-white"
              onClick={() => navigate("/verify")}
            >
              Re-Upload Document
            </Button>
          </div>
        )}
      </CardDescription>
    </CardHeader>
  </Card>
)} {/* ✅ closes verification card */}

        <Tabs defaultValue="nearby" className="space-y-6">
          <TabsList>
            <TabsTrigger value="nearby">Nearby Resources</TabsTrigger>
            <TabsTrigger value="my">My Resources</TabsTrigger>
            {userRole === "donor" && (
              <TabsTrigger value="requests">Requests</TabsTrigger>
            )}
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </TabsList>
<TabsContent value="my" className="space-y-4">
  {userRole === "donor" && (
    <div className="flex justify-end">
      <Button
        className="mb-4 bg-primary"
        onClick={() => navigate("/resources")}
      >
        <Plus className="mr-2 h-4 w-4" /> Add New Resource
      </Button>
    </div>
  )}

  {myResources.length === 0 ? (
    <Card className="p-8 text-center">
      <p>You haven’t added any resources yet.</p>
    </Card>
  ) : (
    myResources.map((resource) => (
      <Card key={resource._id}>
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle className="capitalize">{resource.resourceType}</CardTitle>
              <CardDescription>{resource.address}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="mt-3">
  <label className="text-sm font-medium mr-2">Change Status:</label>
  <select
    value={resource.status}
    onChange={(e) => handleStatusChange(resource._id, e.target.value)}
    className="border rounded-md px-2 py-1"
  >
    <option value="available">available</option>
    <option value="unavailable">Unavailable</option>
  </select>
</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>Status: {resource.status}</p>
          <div className="flex gap-2 mt-4">
            {/* Edit visible to donors (owner) */}
            {userRole === "donor" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleEditResource(resource._id)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteResource(resource._id)}
                  className="flex items-center gap-2"
                >
                  <Trash className="h-4 w-4" /> Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    ))
  )}
</TabsContent>
          {/* Nearby Resources */}
          <TabsContent value="nearby" className="space-y-4">
            {nearbyResources.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>No resources nearby right now.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyResources.map((resource) => (
                  <Card key={resource._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.resourceType)}
                          <CardTitle className="capitalize">
                            {resource.resourceType}
                          </CardTitle>
                        </div>
                        <Badge variant="outline">{resource.status}</Badge>
                      </div>
                      {resource.bloodType && (
                        <Badge variant="secondary">{resource.bloodType}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p>
                        <strong>Address:</strong> {resource.address}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {resource.quantity}
                      </p>
                      {userRole === "requester" && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => handleRequestResource(resource._id)}
                        >
                          Request Resource
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests */}
          {userRole === "donor" && (
            <TabsContent value="requests">
              {Array.isArray(requests) && requests.length > 0 ? (
                requests.map((req) => (
                  <Card key={req._id}>
                    <CardHeader>
                      <CardTitle>
                        Request from{" "}
                        {req.requestor?.full_name ||
                          req.requestor?.email ||
                          "Unknown"}
                      </CardTitle>
                      <CardDescription>
                        For{" "}
                        {req.resource?.bloodType ||
                          req.resource?.resourceType ||
                          "Resource"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleRequestResponse(req._id, "accepted")
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleRequestResponse(req._id, "declined")
                        }
                      >
                        Decline
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p>No requests yet.</p>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Chats */}
          <TabsContent value="chats">
            {Array.isArray(chats) && chats.length > 0 ? (
              chats.map((chat) => {
                const otherUser = chat.participants?.find(
                  (p: any) => p._id !== profile?._id
                );
                return (
                  <Card
                    key={chat._id}
                    className="cursor-pointer hover:shadow-md"
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <CardHeader>
                      <CardTitle>
                        {otherUser?.full_name || otherUser?.email || "Chat"}
                      </CardTitle>
                      <CardDescription>
                        {chat.messages?.length
                          ? chat.messages[chat.messages.length - 1].text
                          : "No messages yet."}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                <p>You don’t have any chats yet.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
