import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Plus, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  qr_code: string;
  created_at: string;
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';

interface Order {
  id: string;
  status: OrderStatus;
  table_number: number;
  quantity: number;
  customer_notes: string;
  created_at: string;
  dishes: {
    name: string;
    price: number;
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRestaurant();
    fetchOrders();
  }, [user, navigate]);

  const fetchRestaurant = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: "Failed to fetch restaurant data",
        variant: "destructive",
      });
    } else {
      setRestaurant(data);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        dishes (name, price)
      `)
      .in('restaurant_id', 
        await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .then(res => res.data?.map(r => r.id) || [])
      )
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const createRestaurant = () => {
    navigate('/restaurant/setup');
  };

  const viewMenu = () => {
    navigate('/menu/manage');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } else {
      fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            {(user?.email?.endsWith('@admin.com') || user?.email === 'admin@armenu.com') && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!restaurant ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create Your Restaurant</CardTitle>
              <CardDescription>
                Set up your restaurant profile to start receiving orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createRestaurant} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>{restaurant.location}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={viewMenu}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Menu
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview Customer Menu
                    </Button>
                    <Button onClick={() => navigate('/restaurant/edit')}>
                      Edit Restaurant
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">QR Code: {restaurant.qr_code}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="menu">Menu Management</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <Badge variant="secondary">{orders.length} total orders</Badge>
                </div>

                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{order.dishes.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Table {order.table_number} • Qty: {order.quantity}
                              </p>
                              {order.customer_notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Note: {order.customer_notes}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                              {order.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="menu">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>
                      Add and manage your dishes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate('/menu/manage')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Menu Items
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qr">
                <QRCodeGenerator 
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;