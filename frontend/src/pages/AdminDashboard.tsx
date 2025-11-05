import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDoc?: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/verify/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast({
          title: "Error loading verifications",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleReview = async (userId: string, status: "verified" | "rejected") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/verify/${userId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: `User ${status === "verified" ? "verified" : "rejected"}`,
          description: `${data.user.fullName} has been ${status}.`,
        });
        fetchUsers(); // refresh list
      } else {
        toast({
          title: "Error updating status",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading verifications...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Verification Dashboard</h1>

      {users.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No users have submitted verification documents yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user._id} className="shadow-md border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>{user.fullName}</CardTitle>
                <p className="text-sm text-gray-500">{user.email}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Status:{" "}
                  <Badge
                    className={
                      user.verificationStatus === "verified"
                        ? "bg-green-600"
                        : user.verificationStatus === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }
                  >
                    {user.verificationStatus}
                  </Badge>
                </p>

                {user.verificationDoc ? (
                  <a
                    href={`http://localhost:5000/${user.verificationDoc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mb-3"
                  >
                    <FileText className="h-4 w-4" /> View Document
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No document uploaded</p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    className="bg-green-600 text-white flex items-center gap-1"
                    onClick={() => handleReview(user._id, "verified")}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-1"
                    onClick={() => handleReview(user._id, "rejected")}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
