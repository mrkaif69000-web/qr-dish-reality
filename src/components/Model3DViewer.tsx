import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { View, Fullscreen, RotateCcw } from 'lucide-react';

interface Model3DViewerProps {
  modelUrl: string;
  name: string;
  className?: string;
  enableAR?: boolean;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} scale={1} />
    </Center>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Model3DViewer({ modelUrl, name, className, enableAR = false }: Model3DViewerProps) {
  const handleARView = () => {
    // Create AR viewer URL - this would integrate with AR frameworks like AR.js or Model Viewer
    const arUrl = `data:text/html,
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>AR View - ${name}</title>
          <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
          <style>
            body { margin: 0; background: #000; }
            model-viewer { width: 100vw; height: 100vh; }
            .ar-button { 
              position: absolute; 
              top: 20px; 
              right: 20px; 
              background: rgba(255,255,255,0.9); 
              border: none; 
              padding: 10px 20px; 
              border-radius: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <model-viewer 
            src="${modelUrl}" 
            ar 
            ar-modes="webxr scene-viewer quick-look" 
            camera-controls 
            environment-image="neutral" 
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E"
            shadow-intensity="1"
            auto-rotate
            auto-rotate-delay="1000">
            <button class="ar-button" slot="ar-button">View in AR</button>
          </model-viewer>
        </body>
      </html>`;
    
    window.open(arUrl, '_blank');
  };

  const handleFullscreen = () => {
    const viewer = document.getElementById(`model-viewer-${modelUrl.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (viewer) {
      viewer.requestFullscreen?.();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          3D Model: {name}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleFullscreen}
              title="Fullscreen"
            >
              <Fullscreen className="h-4 w-4" />
            </Button>
            {enableAR && (
              <Button
                size="sm"
                onClick={handleARView}
                title="View in AR"
              >
                <View className="h-4 w-4 mr-2" />
                AR View
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          id={`model-viewer-${modelUrl.replace(/[^a-zA-Z0-9]/g, '')}`}
          className="w-full h-64 bg-muted rounded-lg overflow-hidden"
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Environment preset="studio" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Model url={modelUrl} />
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                autoRotate={false}
                minDistance={1}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p className="flex items-center justify-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Drag to rotate • Scroll to zoom • Right-click to pan
          </p>
        </div>
      </CardContent>
    </Card>
  );
}