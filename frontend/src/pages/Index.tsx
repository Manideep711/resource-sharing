import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Heart,
  Leaf,
  MapPin,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  const navigate = useNavigate();

  // Feature list for display
  const features = [
    {
      icon: Heart,
      title: "Blood Donation Network",
      description:
        "Connect urgent blood requests with available donors in real-time, saving lives when every second counts.",
    },
    {
      icon: Leaf,
      title: "Food Waste Reduction",
      description:
        "Share surplus food with those in need. Track expiry dates and minimize waste while fighting hunger.",
    },
    {
      icon: MapPin,
      title: "Location-Based Matching",
      description:
        "Smart geolocation technology finds the closest matches, ensuring rapid response and efficient logistics.",
    },
    {
      icon: Clock,
      title: "Real-Time Coordination",
      description:
        "Instant notifications and live updates keep everyone connected for time-sensitive emergencies.",
    },
    {
      icon: Users,
      title: "Community Network",
      description:
        "Join donors, requesters, NGOs, and hospitals in a unified platform for community resilience.",
    },
    {
      icon: TrendingUp,
      title: "Impact Tracking",
      description:
        "Monitor your contributions and see the real difference you're making in your community.",
    },
  ];

  // Mock stats (could later come from backend)
  const stats = [
    { value: "1000+", label: "Active Donors" },
    { value: "500+", label: "Lives Saved" },
    { value: "10K+", label: "Meals Shared" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* 🌟 Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 opacity-50" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Heart className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Saving Lives Together
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                LifeLink: Unified Resource{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Sharing Platform
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Bridge critical gaps in community resource management. Connect
                donors, requesters, NGOs, and hospitals for real-time
                coordination of vital resources like blood and surplus food.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="shadow-glow"
                >
                  Get Started
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Community unity and resource sharing"
                className="relative rounded-3xl shadow-strong object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🧩 Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              How LifeLink Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to save lives, reduce waste, and
              strengthen community bonds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary/50 transition-all hover:shadow-medium"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ❤️ CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary via-accent to-secondary text-white border-0 shadow-strong">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-4xl md:text-5xl font-bold">
                Join the Movement
              </CardTitle>
              <CardDescription className="text-xl text-white/90 max-w-2xl mx-auto">
                Every donation counts. Every life matters. Be part of a
                community that cares.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pb-12">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/auth")}
                  className="shadow-medium"
                >
                  Sign Up as Donor
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Request Resources
                </Button>
              </div>
              <p className="text-sm text-white/80">
                Join {stats[0].value} community members making a difference
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 🌍 Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">LifeLink</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2025 LifeLink. Saving lives, reducing waste, building community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
