import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Box, Smartphone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Model3DViewer from '@/components/Model3DViewer';
import ARViewer from '@/components/ARViewer';

// Sample 3D model URLs (these would normally come from your database)
const SAMPLE_MODELS = [
  {
    id: '1',
    name: 'Delicious Burger',
    description: 'Gourmet beef burger with premium toppings',
    price: 15.99,
    modelUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Hamburger.glb',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop'
  },
  {
    id: '2', 
    name: 'Classic Pizza',
    description: 'Wood-fired margherita pizza with fresh basil',
    price: 18.50,
    modelUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Hamburger.glb', // Using same model for demo
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop'
  }
];

export default function Demo3D() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">3D/AR Demo</h1>
            <p className="text-xl text-muted-foreground">
              Experience the future of restaurant menus
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Box className="h-3 w-3" />
                3D Viewer
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                AR Ready
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                WebXR Compatible
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Our AR Menu Hub brings dishes to life with interactive 3D models and augmented reality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Interactive 3D</h3>
                <p className="text-sm text-muted-foreground">
                  Rotate, zoom, and explore dishes from every angle in stunning 3D detail
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">AR Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Place virtual dishes on your table using your phone's camera
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Universal Access</h3>
                <p className="text-sm text-muted-foreground">
                  Works on any modern device through your web browser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Dishes */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Try Our Demo Dishes</h2>
            <p className="text-muted-foreground">
              Interact with these sample 3D models to see how AR Menu Hub works
            </p>
          </div>

          {SAMPLE_MODELS.map((dish, index) => (
            <Card key={dish.id} className="overflow-hidden">
              <div className="md:flex">
                {/* Left: Traditional Image */}
                <div className="md:w-1/3">
                  <div className="aspect-video bg-muted">
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center bg-muted/30">
                    <p className="text-sm text-muted-foreground">Traditional 2D Image</p>
                  </div>
                </div>

                {/* Center: 3D Model */}
                <div className="md:w-1/3 border-l border-r">
                  <Model3DViewer 
                    modelUrl={dish.modelUrl}
                    name={dish.name}
                    className="border-0 rounded-none"
                    enableAR={false}
                  />
                  <div className="p-4 text-center bg-primary/5">
                    <p className="text-sm font-medium text-primary">Interactive 3D Model</p>
                  </div>
                </div>

                {/* Right: AR Preview */}
                <div className="md:w-1/3">
                  <ARViewer 
                    modelUrl={dish.modelUrl}
                    dishName={dish.name}
                    className="border-0 rounded-none h-full"
                  />
                  <div className="p-4 text-center bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      AR Experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Dish Info */}
              <div className="p-6 border-t">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{dish.name}</h3>
                    <p className="text-muted-foreground mt-1">{dish.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    ${dish.price}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the AR Menu revolution and give your customers an unforgettable dining experience. 
              Set up your restaurant profile and start uploading 3D models today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/')}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            <strong>Technical Requirements:</strong> Modern browser with WebGL support. 
            AR features work best on mobile devices with iOS 12+ or Android 8.0+ and ARCore support.
          </p>
        </div>
      </div>
    </div>
  );
}