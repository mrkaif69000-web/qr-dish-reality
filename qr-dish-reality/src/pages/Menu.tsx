import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Box, Eye } from 'lucide-react';
import Model3DViewer from '@/components/Model3DViewer';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  location: string;
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
}



const Menu = () => {
  const { restaurantId } = useParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
      fetchDishes();
    }
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, location')
      .eq('id', restaurantId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Restaurant not found",
        variant: "destructive",
      });
    } else {
      setRestaurant(data);
    }
  };

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load menu",
        variant: "destructive",
      });
    } else {
      setDishes(data || []);
    }
    setLoading(false);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
            <p className="text-muted-foreground">The menu you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name} - Menu Preview</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.location}</span>
              </div>
            </div>
            <Badge variant="outline">Owner View</Badge>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {dishes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No dishes available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {dishes.map((dish) => (
              <Card key={dish.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Left side - Image and 3D */}
                  <div className="md:w-1/3">
                    {dish.image_url && (
                      <div className="aspect-video bg-muted">
                        <img 
                          src={dish.image_url} 
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {dish.model_url && (
                      <div className="p-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Box className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">3D/AR Available</span>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="h-3 w-3 mr-1" />
                                View 3D
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>3D Preview - {dish.name}</DialogTitle>
                                <DialogDescription>
                                  Interactive 3D model of the dish
                                </DialogDescription>
                              </DialogHeader>
                              <Model3DViewer 
                                modelUrl={dish.model_url}
                                name={dish.name}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="flex-1">
                                AR View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>AR Preview - {dish.name}</DialogTitle>
                                <DialogDescription>
                                  View this dish in augmented reality
                                </DialogDescription>
                              </DialogHeader>
                              <ARViewer 
                                modelUrl={dish.model_url}
                                dishName={dish.name}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Content */}
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{dish.name}</CardTitle>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          ${dish.price}
                        </Badge>
                      </div>
                      {dish.description && (
                        <CardDescription className="text-base">
                          {dish.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dish.ingredients && (
                          <div>
                            <p className="text-sm font-medium mb-1">Ingredients:</p>
                            <p className="text-sm text-muted-foreground">{dish.ingredients}</p>
                          </div>
                        )}
                        
                        {(dish.calories || dish.protein) && (
                          <div className="flex gap-6 text-sm">
                            {dish.calories && (
                              <div>
                                <span className="font-medium">Calories:</span>
                                <span className="ml-1">{dish.calories}</span>
                              </div>
                            )}
                            {dish.protein && (
                              <div>
                                <span className="font-medium">Protein:</span>
                                <span className="ml-1">{dish.protein}g</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={dish.availability ? "default" : "secondary"}>
                            {dish.availability ? "Available" : "Unavailable"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Owner Preview</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;