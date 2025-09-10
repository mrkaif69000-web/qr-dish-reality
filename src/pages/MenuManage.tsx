import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Restaurant {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  ingredients: string;
  calories: number;
  protein: number;
  model_url: string | null;
  availability: boolean;
  preparation_time_minutes: number;
}

const MenuManage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchDishes();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('owner_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
    } else {
      setRestaurants(data || []);
      if (data && data.length > 0) {
        setSelectedRestaurant(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', selectedRestaurant)
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load dishes",
        variant: "destructive",
      });
    } else {
      setDishes(data || []);
    }
  };

  const handleUpdateDish = async (dish: Dish) => {
    const { error } = await supabase
      .from('dishes')
      .update({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        preparation_time_minutes: dish.preparation_time_minutes,
        availability: dish.availability,
        ingredients: dish.ingredients,
        calories: dish.calories,
        protein: dish.protein,
      })
      .eq('id', dish.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update dish",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Dish updated successfully",
      });
      setEditingDish(null);
      fetchDishes();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to manage your menu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Menu</h1>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No restaurants found. Please create a restaurant first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Restaurant Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {restaurants.map((restaurant) => (
                    <Button
                      key={restaurant.id}
                      variant={selectedRestaurant === restaurant.id ? "default" : "outline"}
                      onClick={() => setSelectedRestaurant(restaurant.id)}
                    >
                      {restaurant.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dishes List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Dishes</CardTitle>
                  <Button onClick={() => setIsAddingNew(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Dish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="border rounded-lg p-4">
                      {editingDish?.id === dish.id ? (
                        <EditDishForm
                          dish={editingDish}
                          onSave={handleUpdateDish}
                          onCancel={() => setEditingDish(null)}
                          onChange={setEditingDish}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{dish.name}</h3>
                              <Badge variant={dish.availability ? "default" : "secondary"}>
                                {dish.availability ? "Available" : "Unavailable"}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {dish.preparation_time_minutes} mins
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{dish.description}</p>
                            <div className="flex gap-4 text-sm">
                              <span className="font-medium">${dish.price}</span>
                              {dish.calories && <span>{dish.calories} cal</span>}
                              {dish.protein && <span>{dish.protein}g protein</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingDish(dish)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const EditDishForm = ({ 
  dish, 
  onSave, 
  onCancel, 
  onChange 
}: { 
  dish: Dish; 
  onSave: (dish: Dish) => void; 
  onCancel: () => void;
  onChange: (dish: Dish) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={dish.name}
            onChange={(e) => onChange({ ...dish, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={dish.price}
            onChange={(e) => onChange({ ...dish, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={dish.description}
          onChange={(e) => onChange({ ...dish, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="prep-time">Preparation Time (minutes)</Label>
          <Input
            id="prep-time"
            type="number"
            value={dish.preparation_time_minutes}
            onChange={(e) => onChange({ ...dish, preparation_time_minutes: parseInt(e.target.value) || 15 })}
          />
        </div>
        <div>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            value={dish.calories || ''}
            onChange={(e) => onChange({ ...dish, calories: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            type="number"
            value={dish.protein || ''}
            onChange={(e) => onChange({ ...dish, protein: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea
          id="ingredients"
          value={dish.ingredients}
          onChange={(e) => onChange({ ...dish, ingredients: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="availability"
          checked={dish.availability}
          onCheckedChange={(checked) => onChange({ ...dish, availability: checked })}
        />
        <Label htmlFor="availability">Available for ordering</Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(dish)}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default MenuManage;