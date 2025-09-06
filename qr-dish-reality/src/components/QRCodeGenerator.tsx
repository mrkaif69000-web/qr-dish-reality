import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink } from 'lucide-react';
import NetworkTest from './NetworkTest';

interface QRCodeGeneratorProps {
  restaurantId: string;
  restaurantName: string;
}

const QRCodeGenerator = ({ restaurantId, restaurantName }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [networkUrl, setNetworkUrl] = useState<string>('');
  
  const getNetworkUrl = async () => {
    // For development, try to get network IP
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Show instruction to user about network access
      return `http://[YOUR-COMPUTER-IP]:${window.location.port}/order/${restaurantId}`;
    }
    return `${window.location.origin}/order/${restaurantId}`;
  };
  
  const menuUrl = networkUrl || `${window.location.origin}/order/${restaurantId}`;

  useEffect(() => {
    initializeUrl();
  }, [restaurantId]);
  
  const initializeUrl = async () => {
    const url = await getNetworkUrl();
    setNetworkUrl(url);
    generateQRCode(url);
  };

  const generateQRCode = async (urlToEncode?: string) => {
    try {
      setLoading(true);
      const targetUrl = urlToEncode || menuUrl;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${restaurantName}-menu-qr.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openMenu = () => {
    window.open(menuUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <NetworkTest />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          QR Code Menu
        </CardTitle>
        <CardDescription>
          Customers can scan this code to view your menu and place orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="w-64 h-64 bg-muted animate-pulse rounded-lg" />
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code for menu" 
                className="w-48 h-48"
              />
            </div>
          )}
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Scan to view menu
            </p>
            <p className="text-xs text-muted-foreground break-all">
              {menuUrl}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={downloadQRCode} 
            disabled={loading || !qrCodeUrl}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            onClick={openMenu}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Menu
          </Button>
        </div>
        
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Network Access:</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter your IP (e.g., 192.168.1.100)"
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                onChange={(e) => {
                  const ip = e.target.value;
                  if (ip) {
                    const newUrl = `http://${ip}:${window.location.port}/order/${restaurantId}`;
                    setNetworkUrl(newUrl);
                    generateQRCode(newUrl);
                  }
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-muted p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">How to use:</p>
          <ol className="text-muted-foreground space-y-1 text-xs">
            <li>1. Download and print the QR code</li>
            <li>2. Place it on tables or display it prominently</li>
            <li>3. Customers scan with their phone camera</li>
            <li>4. They can view menu and place orders instantly</li>
          </ol>
        </div>
        
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
            <p className="font-medium text-yellow-800 mb-1">⚠️ Development Mode:</p>
            <p className="text-yellow-700 text-xs mb-2">
              For other devices to access the menu, replace 'localhost' with your computer's IP address in the URL above.
            </p>
            <p className="text-yellow-700 text-xs">
              Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default QRCodeGenerator;