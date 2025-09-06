import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Restaurant Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Authentication system coming soon...
            </p>
            <Button variant="outline" disabled={loading}>
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;