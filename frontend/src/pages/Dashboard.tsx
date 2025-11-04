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
  User,
  MessageCircle,
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
  full_name: string;
  phone?: string;
  blood_type?: string;
  organization_name?: string;
  email?: string;
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

      // fetch chats
      const chatRes = await fetch("http://localhost:5000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatData = await chatRes.json();
      setChats(chatData || []);

      // fetch requests for donors
      if (data.user.role === "donor") {
        const reqRes = await fetch("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        setRequests(reqData || []);
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
              ? "You’ve accepted this request."
              : "You’ve declined this request.",
        });
        loadUserData();
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "donor":
        return <Heart className="h-5 w-5" />;
      case "ngo":
      case "hospital":
        return <Leaf className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
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
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
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
            <div className="flex items-center gap-2">
              {getRoleIcon(userRole)}
              <span className="font-medium">{profile?.full_name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 border-l-4 border-l-primary shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome back, {profile?.full_name || profile?.email}!
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

        {/* Tabs */}
        <Tabs defaultValue="nearby" className="space-y-6">
          <TabsList>
            <TabsTrigger value="nearby">Nearby Resources</TabsTrigger>
            <TabsTrigger value="my">My Resources</TabsTrigger>
            {userRole === "donor" && (
              <TabsTrigger value="requests">Requests</TabsTrigger>
            )}
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </TabsList>

          {/* Nearby Resources */}
          <TabsContent value="nearby" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Available Resources Near You
              </h2>
              {userRole === "donor" && (
                <Button onClick={() => navigate("/resources")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Resource
                </Button>
              )}
            </div>
            {nearbyResources.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No resources available nearby at the moment.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyResources.map((resource) => (
                  <Card
                    key={resource._id}
                    className="hover:shadow-medium transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.resourceType)}
                          <CardTitle className="text-lg capitalize">
                            {resource.resourceType}
                          </CardTitle>
                        </div>
                        <Badge variant="outline">{resource.status}</Badge>
                      </div>
                      {resource.bloodType && (
                        <Badge variant="secondary" className="w-fit">
                          {resource.bloodType}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {resource.address || "Location not specified"}
                        </span>
                      </div>
                      <p className="text-sm">
                        <strong>Quantity:</strong> {resource.quantity}
                      </p>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      {resource.expiresAt && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires:{" "}
                            {new Date(resource.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {userRole === "requestor" && (
                        <Button
                          variant="default"
                          className="w-full mt-4"
                          onClick={() =>
                            handleRequestResource(resource._id)
                          }
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

          {/* My Resources */}
          <TabsContent value="my" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Posted Resources</h2>
              {userRole === "donor" && (
                <Button onClick={() => navigate("/resources")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              )}
            </div>
            {myResources.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't posted any resources yet.
                </p>
                {userRole === "donor" && (
                  <Button onClick={() => navigate("/resources")}>
                    Create Your First Resource
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myResources.map((resource) => (
                  <Card key={resource._id} className="hover:shadow-medium transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.resourceType)}
                          <CardTitle className="text-lg capitalize">
                            {resource.resourceType}
                          </CardTitle>
                        </div>
                        <Badge
                          variant={
                            resource.status === "available"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {resource.status}
                        </Badge>
                      </div>
                      {resource.bloodType && (
                        <Badge variant="secondary" className="w-fit">
                          {resource.bloodType}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        <strong>Quantity:</strong> {resource.quantity}
                      </p>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      {resource.expiresAt && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires:{" "}
                            {new Date(resource.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests (for Donors) */}
          {userRole === "donor" && (
            <TabsContent value="requests" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Incoming Requests</h2>
              </div>

              {requests.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No requests yet.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.map((req) => (
                    <Card key={req._id} className="hover:shadow-medium transition-shadow">
                      <CardHeader>
                        <CardTitle>
                          Request from {req.requestor.fullName}
                        </CardTitle>
                        <CardDescription>
                          For {req.resource.bloodType || req.resource.resourceType}
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
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Chats</h2>
            </div>

            {chats.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You don’t have any chats yet.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chats.map((chat) => {
                  const otherUser = chat.participants?.find(
                    (p: any) => p._id !== profile?._id
                  );

                  return (
                    <Card
                      key={chat._id}
                      onClick={() => navigate(`/chat/${chat._id}`)}
                      className="cursor-pointer hover:shadow-medium transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {otherUser?.fullName ||
                                otherUser?.email ||
                                "Chat"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>
                          {chat.messages?.length
                            ? chat.messages[chat.messages.length - 1].text
                            : "No messages yet."}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
