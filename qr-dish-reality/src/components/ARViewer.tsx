import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ARViewerProps {
  modelUrl: string;
  dishName: string;
  className?: string;
}

export default function ARViewer({ modelUrl, dishName, className }: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isCheckingSupport, setIsCheckingSupport] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    setIsCheckingSupport(true);
    
    try {
      // Check for WebXR support
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        if (xr) {
          const supported = await xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        }
      }
      
      // Fallback check for AR.js or other AR frameworks
      if (!isARSupported) {
        // Check for mobile device (more likely to support AR)
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsARSupported(isMobile);
      }
    } catch (error) {
      console.error('AR support check failed:', error);
      setIsARSupported(false);
    } finally {
      setIsCheckingSupport(false);
    }
  };

  const openModelViewer = () => {
    const modelViewerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AR View - ${dishName}</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
        body {
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
            color: #333;
        }
        
        model-viewer {
            flex: 1;
            width: 100%;
            background-color: transparent;
        }
        
        .ar-button {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .ar-button:hover {
            background: #45a049;
            transform: translateX(-50%) translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
        }
        
        .controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
        }
        
        .control-btn {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .control-btn:hover {
            background: white;
            transform: scale(1.05);
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            text-align: center;
        }
        
        .spinner {
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .instructions {
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            text-align: center;
            max-width: 80%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${dishName}</h1>
    </div>
    
    <div class="controls">
        <button class="control-btn" onclick="window.close()">✕ Close</button>
        <button class="control-btn" onclick="toggleAutoRotate()">🔄 Rotate</button>
    </div>
    
    <model-viewer 
        src="${modelUrl}"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        environment-image="neutral"
        exposure="1"
        shadow-intensity="1"
        auto-rotate
        auto-rotate-delay="3000"
        rotation-per-second="0.5rad"
        interaction-prompt="auto"
        loading="eager">
        
        <div class="loading" slot="poster">
            <div class="spinner"></div>
            <div>Loading 3D Model...</div>
        </div>
        
        <button class="ar-button" slot="ar-button">
            📱 View in AR
        </button>
    </model-viewer>
    
    <div class="instructions">
        Drag to rotate • Pinch to zoom • Tap AR button for augmented reality
    </div>
    
    <script>
        let autoRotateEnabled = true;
        
        function toggleAutoRotate() {
            const modelViewer = document.querySelector('model-viewer');
            autoRotateEnabled = !autoRotateEnabled;
            
            if (autoRotateEnabled) {
                modelViewer.setAttribute('auto-rotate', '');
            } else {
                modelViewer.removeAttribute('auto-rotate');
            }
        }
        
        // Track loading events
        const modelViewer = document.querySelector('model-viewer');
        
        modelViewer.addEventListener('load', () => {
            console.log('Model loaded successfully');
        });
        
        modelViewer.addEventListener('error', (event) => {
            console.error('Model failed to load:', event);
            const loading = document.querySelector('.loading');
            if (loading) {
                loading.innerHTML = '<div style="color: #ff6b6b;">Failed to load 3D model</div>';
            }
        });
        
        // AR session events
        modelViewer.addEventListener('ar-status', (event) => {
            console.log('AR Status:', event.detail.status);
        });
    </script>
</body>
</html>
    `;

    const blob = new Blob([modelViewerHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, '_blank', 'width=400,height=600,scrollbars=no,resizable=yes');
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    if (!popup) {
      toast({
        title: "Popup blocked",
        description: "Please allow popups to view the AR model.",
        variant: "destructive",
      });
    }
  };

  const openARInstructions = () => {
    toast({
      title: "AR Viewing Instructions",
      description: "Point your camera at a flat surface, then tap 'Place Object' to see the dish in your space.",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          AR Preview
        </CardTitle>
        <CardDescription>
          View this dish in augmented reality on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">AR Status</p>
              <p className="text-sm text-muted-foreground">
                {isCheckingSupport ? (
                  "Checking device compatibility..."
                ) : isARSupported ? (
                  "AR supported on this device"
                ) : (
                  "AR support not detected"
                )}
              </p>
            </div>
          </div>
          <Badge variant={isARSupported ? "default" : "secondary"}>
            {isCheckingSupport ? "Checking..." : isARSupported ? "Supported" : "Limited"}
          </Badge>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={openModelViewer}
            className="w-full"
            size="lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            View in 3D/AR
          </Button>
          
          <Button 
            variant="outline"
            onClick={openARInstructions}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            AR Instructions
          </Button>
        </div>

        {!isARSupported && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Limited AR Support
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                For the best AR experience, use a mobile device with iOS 12+ or Android 8.0+
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Compatible devices:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>iPhone 6s and newer (iOS 12+)</li>
            <li>Android phones with ARCore support</li>
            <li>Recent iPad models</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}