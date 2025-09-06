import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Admin features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;