import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Store, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  qr_code: string | null;
}

const Index = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, location, qr_code')
        .order('name');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load restaurants",
          variant: "destructive",
        });
      } else {
        setRestaurants(data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">QR Dish Reality</h1>
                <p className="text-muted-foreground">Discover amazing restaurants</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="outline">Restaurant Login</Button>
              </Link>
              <Link to="/demo-3d">
                <Button>3D Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Restaurants</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse menus with 3D dish previews and augmented reality experiences. 
            Simply click on any restaurant to view their menu and place orders.
          </p>
        </div>

        {restaurants.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No restaurants available</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to add your restaurant to our platform.
              </p>
              <Link to="/auth">
                <Button>Add Your Restaurant</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{restaurant.name}</CardTitle>
                      {restaurant.location && (
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {restaurant.location}
                        </CardDescription>
                      )}
                    </div>
                    {restaurant.qr_code && (
                      <Badge variant="secondary" className="ml-2">
                        QR Available
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      View menu with 3D dish previews and place orders directly from your table.
                    </p>
                    
                    <div className="flex gap-3">
                      <Link to={`/order/${restaurant.id}`} className="flex-1">
                        <Button className="w-full">
                          View Menu & Order
                        </Button>
                      </Link>
                      
                      {restaurant.qr_code && (
                        <Link to={`/menu/${restaurant.id}`}>
                          <Button variant="outline" size="icon">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Features Section */}
        <section className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Choose QR Dish Reality?</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold">QR Code Ordering</h4>
              <p className="text-muted-foreground">
                Scan QR codes at your table to instantly access the menu and place orders
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold">3D Dish Previews</h4>
              <p className="text-muted-foreground">
                See realistic 3D models of dishes before ordering to know exactly what you're getting
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold">AR Experience</h4>
              <p className="text-muted-foreground">
                Use augmented reality to visualize dishes on your table before ordering
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-semibold">QR Dish Reality</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 QR Dish Reality. Transforming dining with technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;