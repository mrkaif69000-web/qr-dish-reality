import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const NetworkTest = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get network info
    setNetworkInfo(`${window.location.protocol}//${window.location.host}`);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Connection:</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Current URL:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{networkInfo}</code>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <p>For other devices to access:</p>
            <p>1. Find your computer's IP address</p>
            <p>2. Replace 'localhost' with your IP in the QR code</p>
            <p>3. Ensure port 8080 is not blocked by firewall</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkTest;