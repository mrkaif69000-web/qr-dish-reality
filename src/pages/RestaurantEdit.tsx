import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RestaurantEdit = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Restaurant</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Restaurant editing features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantEdit;