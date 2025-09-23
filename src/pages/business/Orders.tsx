import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, Package, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Order {
  id: string;
  status: string;
  total_amount: number | null;
  delivery_estimate: string | null;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      code: string;
      name: string;
    };
  }>;
}

const BusinessOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      // First get the user's shop
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (shopError || !shop) {
        toast({
          title: "Error",
          description: "No shop found for your account",
          variant: "destructive",
        });
        return;
      }

      // Then get orders for this shop
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            products (code, name)
          )
        `)
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      delivered: "secondary"
    };

    const colors: Record<string, string> = {
      pending: "⏳ Pending Review",
      approved: "✅ Approved",
      rejected: "❌ Rejected",
      delivered: "🚚 Delivered"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {colors[status] || status}
      </Badge>
    );
  };

  const calculateOrderTotal = (orderItems: Order['order_items']) => {
    return orderItems.reduce((total, item) => total + item.total_price, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground mt-2">
                View and track your order history
              </p>
            </div>
            <Button asChild>
              <Link to="/products">
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order History ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Items:</strong> {order.order_items.length} products</p>
                        {order.delivery_estimate && (
                          <p><strong>Delivery Estimate:</strong> {order.delivery_estimate}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-2">
                        ${calculateOrderTotal(order.order_items).toFixed(2)}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Order Details - #{order.id.slice(0, 8).toUpperCase()}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Order Information</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
                                  <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                  <p><strong>Total:</strong> ${calculateOrderTotal(order.order_items).toFixed(2)}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Delivery</h4>
                                <div className="text-sm space-y-1">
                                  {order.delivery_estimate ? (
                                    <p><strong>Estimate:</strong> {order.delivery_estimate}</p>
                                  ) : (
                                    <p className="text-muted-foreground">
                                      Delivery estimate will be provided after approval
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Items Ordered</h4>
                              <div className="space-y-2">
                                {order.order_items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-accent/10 rounded">
                                    <div>
                                      <span className="font-medium">{item.products.code}</span> - {item.products.name}
                                    </div>
                                    <div className="text-right">
                                      <div>{item.quantity} × ${item.unit_price} = ${item.total_price.toFixed(2)}</div>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center p-3 bg-primary/10 rounded font-semibold">
                                  <span>Total Amount</span>
                                  <span>${calculateOrderTotal(order.order_items).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.order_items.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-accent/10 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-sm">{item.products.code}</span>
                            <p className="text-xs text-muted-foreground">{item.products.name}</p>
                          </div>
                          <div className="text-right text-sm">
                            <div>{item.quantity} pcs</div>
                            <div className="font-semibold">${item.total_price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="bg-accent/10 rounded-lg p-3 flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          +{order.order_items.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status-specific information */}
                  {order.status === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Your order is being reviewed. You'll receive a confirmation call soon.
                      </p>
                    </div>
                  )}

                  {order.status === 'approved' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Order approved! Your products are being prepared for delivery.
                      </p>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        🚚 Order delivered successfully! Thank you for your business.
                      </p>
                    </div>
                  )}

                  {order.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ This order was rejected. Please contact us for more information.
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by browsing our products and placing your first order.
                  </p>
                  <Button asChild>
                    <Link to="/products">
                      <Package className="w-4 h-4 mr-2" />
                      Browse Products
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessOrders;