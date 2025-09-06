import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Demo3D = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">3D Demo</h1>
        <Card>
          <CardHeader>
            <CardTitle>3D Model Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">3D demo features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Demo3D;