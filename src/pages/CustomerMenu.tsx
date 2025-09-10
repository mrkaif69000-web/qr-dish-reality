import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Minus, ShoppingCart, MapPin, Box, Eye, Clock } from 'lucide-react';
import ARViewer from '@/components/ARViewer';
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
  preparation_time_minutes: number;
}

interface CartItem {
  dish: Dish;
  quantity: number;
}

const CustomerMenu = () => {
  const { restaurantId } = useParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

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

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart",
      description: `${dish.name} added to your order`,
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dishId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.dish.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (!tableNumber || cart.length === 0) {
      toast({
        title: "Missing information",
        description: "Please enter table number and add items to cart",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);

    try {
      // Calculate total amount
      const totalAmount = getTotalPrice();
      let orderId = '';

      // Create orders for each item in the cart
      for (const item of cart) {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            restaurant_id: restaurantId,
            dish_id: item.dish.id,
            quantity: item.quantity,
            table_number: parseInt(tableNumber),
            customer_notes: customerNotes,
            status: 'pending'
          })
          .select('id')
          .single();

        if (error) throw error;
        
        // Use the first order ID for the success page
        if (!orderId) {
          orderId = data.id;
        }
      }

      toast({
        title: "Order placed successfully!",
        description: `Order ID: ${orderId.slice(0, 8)}... - Total: $${totalAmount.toFixed(2)}`,
      });

      // Redirect to order success page
      setTimeout(() => {
        window.location.href = `/order-success/${orderId}`;
      }, 1500);

      setCart([]);
      setTableNumber('');
      setCustomerNotes('');
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
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
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.location}</span>
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {getTotalItems() > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Order</DialogTitle>
                  <DialogDescription>
                    Review and place your order
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.dish.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.dish.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${item.dish.price} × {item.quantity}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.dish.preparation_time_minutes} mins
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.dish.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item.dish)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span>${getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Table Number *</label>
                          <Input
                            type="number"
                            placeholder="Enter table number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Special Instructions</label>
                          <Textarea
                            placeholder="Any special requests or allergies?"
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <Button 
                          onClick={placeOrder} 
                          disabled={isOrdering || !tableNumber || cart.length === 0}
                          className="w-full"
                        >
                          {isOrdering ? 'Placing Order...' : 'Place Order'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

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
                        
                        <Button 
                          onClick={() => addToCart(dish)}
                          className="w-full"
                          size="lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart - ${dish.price}
                        </Button>
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

export default CustomerMenu;