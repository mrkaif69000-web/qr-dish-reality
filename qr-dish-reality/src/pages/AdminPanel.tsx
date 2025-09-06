import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  created_at: string;
  dishes_count: number;
  orders_count: number;
  owner_name?: string;
}

interface User {
  id: string;
  full_name: string;
  created_at: string;
  restaurants_count: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  table_number: number;
  quantity: number;
  restaurants: {
    name: string;
  };
  dishes: {
    name: string;
    price: number;
  };
}

interface AdminStats {
  totalRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  newRestaurantsThisWeek: number;
}

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Simple admin check - in production, this should be role-based
  const isAdmin = user?.email?.endsWith('@admin.com') || user?.email === 'admin@armenu.com';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, navigate, isAdmin]);

  const fetchAdminData = async () => {
    try {
      await Promise.all([
        fetchRestaurants(),
        fetchUsers(),
        fetchRecentOrders(),
        fetchStats()
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Get counts and owner info separately for each restaurant
      const restaurantsWithCounts = await Promise.all(
        data.map(async (restaurant) => {
          const [dishesCount, ordersCount, ownerInfo] = await Promise.all([
            supabase.from('dishes').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurant.id),
            supabase.from('profiles').select('full_name').eq('user_id', restaurant.owner_id).single()
          ]);
          
          return {
            ...restaurant,
            dishes_count: dishesCount.count || 0,
            orders_count: ordersCount.count || 0,
            owner_name: ownerInfo.data?.full_name || 'Unknown'
          };
        })
      );
      
      setRestaurants(restaurantsWithCounts);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      // Get restaurant counts separately for each user
      const usersWithCounts = await Promise.all(
        data.map(async (user) => {
          const { count } = await supabase
            .from('restaurants')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', user.user_id);
          
          return {
            ...user,
            restaurants_count: count || 0
          };
        })
      );
      
      setUsers(usersWithCounts);
    }
  };

  const fetchRecentOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (name),
        dishes (name, price)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setRecentOrders(data);
    }
  };

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      restaurantsCount,
      usersCount,
      ordersCount,
      ordersToday,
      newRestaurants,
      revenueData
    ] = await Promise.all([
      supabase.from('restaurants').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('restaurants').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('orders').select('dishes(price), quantity')
    ]);

    const totalRevenue = revenueData.data?.reduce((sum, order) => 
      sum + (order.dishes?.price || 0) * order.quantity, 0
    ) || 0;

    setStats({
      totalRestaurants: restaurantsCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue,
      ordersToday: ordersToday.count || 0,
      newRestaurantsThisWeek: newRestaurants.count || 0
    });
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">AR Menu Hub Platform Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              My Dashboard
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Restaurants</p>
                    <p className="text-2xl font-bold">{stats.totalRestaurants}</p>
                  </div>
                  <Store className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">{stats.ordersToday}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New (7d)</p>
                    <p className="text-2xl font-bold">{stats.newRestaurantsThisWeek}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants, users, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <TabsContent value="restaurants" className="space-y-4">
            <div className="grid gap-4">
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <p className="text-muted-foreground">{restaurant.location}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {restaurant.owner_name || 'N/A'}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            {restaurant.dishes_count} dishes
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {restaurant.orders_count} orders
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Menu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{user.full_name || 'Unnamed User'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.restaurants_count} restaurant(s)
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {recentOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{order.dishes?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.restaurants?.name} • Table {order.table_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          ${((order.dishes?.price || 0) * order.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;