import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RestaurantSetup = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Restaurant Setup</h1>
        <Card>
          <CardHeader>
            <CardTitle>Setup Your Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Restaurant setup features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantSetup;