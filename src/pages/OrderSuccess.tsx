import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowLeft, Receipt } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState({
    orderId: orderId || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    status: 'pending',
    timestamp: new Date().toISOString(),
    estimatedTime: '15-20 minutes'
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Order Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Your order has been sent to the kitchen and is being prepared.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Order ID:</span>
              <Badge variant="outline" className="font-mono">
                {orderDetails.orderId}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="secondary" className="capitalize">
                <Clock className="h-3 w-3 mr-1" />
                {orderDetails.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Time:</span>
              <span className="text-sm text-muted-foreground">
                {orderDetails.estimatedTime}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Order Time:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(orderDetails.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">What happens next?</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Kitchen will prepare your order</li>
                  <li>• You'll be notified when ready</li>
                  <li>• Food will be served to your table</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse More Restaurants
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => window.print()}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Thank you for choosing QR Dish Reality!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;