import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  location: string;
  qr_code: string | null;
}

const RestaurantEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchRestaurant();
  }, [user, navigate]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user?.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No restaurant found, redirect to setup
          navigate("/restaurant/setup");
          return;
        }
        throw error;
      }

      setRestaurant(data);
      setFormData({
        name: data.name,
        location: data.location || "",
      });
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurant data.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: formData.name,
          location: formData.location,
        })
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({
        title: "Restaurant updated successfully!",
        description: "Your changes have been saved.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Error",
        description: "Failed to update restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-muted-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Restaurant</CardTitle>
            <CardDescription>
              Update your restaurant information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter restaurant name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter restaurant location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || !formData.name.trim()}
                >
                  {loading ? "Updating..." : "Update Restaurant"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantEdit;