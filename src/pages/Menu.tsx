import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowLeft, ShoppingCart, Clock } from 'lucide-react';
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
  preparation_time_minutes: number;
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
      .eq('availability', true)
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
            <p className="text-muted-foreground mb-4">The menu you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Restaurants
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.location}</span>
                </div>
              </div>
            </div>
            
            <Link to={`/order/${restaurantId}`}>
              <Button size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Menu</h2>
          <p className="text-lg text-muted-foreground">
            Browse our dishes below. Click "Order Now" to start placing your order with our interactive cart system.
          </p>
        </div>

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
                        <Badge variant="secondary" className="mb-2">
                          3D/AR Available
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Interactive 3D preview and AR visualization available when ordering
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{dish.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{dish.preparation_time_minutes} mins prep</span>
                          </div>
                        </div>
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
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-primary/5 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Ready to Order?</h3>
          <p className="text-muted-foreground mb-6">
            Start your order with our interactive cart system featuring 3D previews and AR visualization.
          </p>
          <Link to={`/order/${restaurantId}`}>
            <Button size="lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Start Ordering
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Menu;