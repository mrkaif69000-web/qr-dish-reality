import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Dashboard features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;