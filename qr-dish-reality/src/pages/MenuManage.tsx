import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Box } from "lucide-react";
import Model3DUploader from "@/components/Model3DUploader";
import Model3DViewer from "@/components/Model3DViewer";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  availability: boolean;
  ingredients: string | null;
  calories: number | null;
  protein: number | null;
  image_url: string | null;
  model_url: string | null;
}

const MenuManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    ingredients: "",
    calories: "",
    protein: "",
    image_url: "",
    model_url: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchRestaurantAndDishes();
  }, [user, navigate]);

  const fetchRestaurantAndDishes = async () => {
    try {
      // First get restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (restaurantError) {
        if (restaurantError.code === "PGRST116") {
          navigate("/restaurant/setup");
          return;
        }
        throw restaurantError;
      }

      setRestaurantId(restaurant.id);

      // Then get dishes
      const { data: dishesData, error: dishesError } = await supabase
        .from("dishes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (dishesError) throw dishesError;

      setDishes(dishesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load menu data.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    
    setLoading(true);

    try {
      const dishData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        ingredients: formData.ingredients || null,
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        image_url: formData.image_url || null,
        model_url: formData.model_url || null,
        restaurant_id: restaurantId,
      };

      if (editingDish) {
        const { error } = await supabase
          .from("dishes")
          .update(dishData)
          .eq("id", editingDish.id);

        if (error) throw error;

        toast({
          title: "Dish updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from("dishes")
          .insert(dishData);

        if (error) throw error;

        toast({
          title: "Dish added successfully!",
        });
      }

      resetForm();
      fetchRestaurantAndDishes();
    } catch (error) {
      console.error("Error saving dish:", error);
      toast({
        title: "Error",
        description: "Failed to save dish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    try {
      const { error } = await supabase
        .from("dishes")
        .update({ availability: !dish.availability })
        .eq("id", dish.id);

      if (error) throw error;

      setDishes(dishes.map(d => 
        d.id === dish.id ? { ...d, availability: !d.availability } : d
      ));

      toast({
        title: `Dish ${!dish.availability ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (dishId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
      const { error } = await supabase
        .from("dishes")
        .delete()
        .eq("id", dishId);

      if (error) throw error;

      setDishes(dishes.filter(d => d.id !== dishId));
      toast({
        title: "Dish deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting dish:", error);
      toast({
        title: "Error",
        description: "Failed to delete dish.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      ingredients: "",
      calories: "",
      protein: "",
      image_url: "",
      model_url: "",
    });
    setShowAddForm(false);
    setEditingDish(null);
  };

  const startEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || "",
      price: dish.price.toString(),
      ingredients: dish.ingredients || "",
      calories: dish.calories?.toString() || "",
      protein: dish.protein?.toString() || "",
      image_url: dish.image_url || "",
      model_url: dish.model_url || "",
    });
    setShowAddForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground">Add, edit, and manage your restaurant dishes</p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Dish
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingDish ? "Edit Dish" : "Add New Dish"}</CardTitle>
              <CardDescription>
                {editingDish ? "Update dish information" : "Add a new dish to your menu"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dish Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      name="protein"
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model_url">3D Model URL (for AR)</Label>
                    <Input
                      id="model_url"
                      name="model_url"
                      type="url"
                      value={formData.model_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/model.glb"
                    />
                  </div>
                  
                  <Model3DUploader 
                    onModelUploaded={(url) => setFormData(prev => ({ ...prev, model_url: url }))}
                    currentModelUrl={formData.model_url}
                  />
                  
                  {formData.model_url && (
                    <Model3DViewer 
                      modelUrl={formData.model_url}
                      name={formData.name || "Dish Preview"}
                      className="mt-4"
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingDish ? "Update Dish" : "Add Dish"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {dishes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">
                  No dishes in your menu yet. Add your first dish to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            dishes.map((dish) => (
              <Card key={dish.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{dish.name}</h3>
                        <Badge variant={dish.availability ? "default" : "secondary"}>
                          {dish.availability ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary mb-2">${dish.price}</p>
                      {dish.description && (
                        <p className="text-muted-foreground mb-2">{dish.description}</p>
                      )}
                      {dish.ingredients && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Ingredients:</strong> {dish.ingredients}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {dish.calories && <span>{dish.calories} cal</span>}
                        {dish.protein && <span>{dish.protein}g protein</span>}
                        {dish.model_url && (
                          <span className="flex items-center gap-1 text-primary">
                            <Box className="h-3 w-3" />
                            3D/AR Ready
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={dish.availability}
                          onCheckedChange={() => handleToggleAvailability(dish)}
                        />
                        <Label className="text-sm">Available</Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(dish)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(dish.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManage;