import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MenuManage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Menu</h1>
        <Card>
          <CardHeader>
            <CardTitle>Menu Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Menu management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuManage;