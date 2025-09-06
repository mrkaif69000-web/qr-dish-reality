import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Smartphone, ChefHat, Eye } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: QrCode,
      title: "QR Code Menu",
      description: "Generate QR codes that customers can scan to view your digital menu instantly"
    },
    {
      icon: Eye,
      title: "3D AR Preview",
      description: "Let customers view dishes in 3D and AR before ordering for an immersive experience"
    },
    {
      icon: Smartphone,
      title: "No App Required",
      description: "Customers simply scan and order - no downloads or registrations needed"
    },
    {
      icon: ChefHat,
      title: "Real-time Orders",
      description: "Receive orders instantly in your dashboard and manage them in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              AR Menu Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your restaurant experience with QR code menus and 3D AR food previews. 
              Let customers see, explore, and order dishes like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started for Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/demo-3d')}>
                View 3D/AR Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose AR Menu Hub?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Modern dining experiences that boost customer engagement and streamline your operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join restaurants worldwide who are already using AR Menu Hub to enhance their customer experience
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
