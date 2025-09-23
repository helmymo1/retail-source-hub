import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, X, Truck, Eye, Printer, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApproveOrderDialog } from '@/components/ApproveOrderDialog';
import { useReactToPrint } from 'react-to-print';
import { PrintableOrder } from '@/components/PrintableOrder';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Order {
  id: string;
  status: string;
  total_amount: number | null;
  delivery_estimate: string | null;
  created_at: string;
  shops: {
    name: string;
    location: string;
    profiles: { full_name: string; phone: string };
  };
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

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const componentRef = useRef<any>();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("order.pdf");
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.rpc('get_orders_with_details');

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

  const updateOrderStatus = async (orderId: string, status: string, estimate?: string) => {
    try {
      const updateData: any = { status };
      if (estimate) {
        updateData.delivery_estimate = estimate;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order ${status} successfully`,
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      delivered: "secondary"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage customer orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{order.shops.name}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Owner:</strong> {order.shops.profiles.full_name}</p>
                        <p><strong>Phone:</strong> {order.shops.profiles.phone}</p>
                        <p><strong>Location:</strong> {order.shops.location}</p>
                        <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                        {order.delivery_estimate && (
                          <p><strong>Delivery Estimate:</strong> {order.delivery_estimate}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-2">
                        ${calculateOrderTotal(order.order_items).toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.shops.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Shop Information</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Name:</strong> {order.shops.name}</p>
                                    <p><strong>Owner:</strong> {order.shops.profiles.full_name}</p>
                                    <p><strong>Phone:</strong> {order.shops.profiles.phone}</p>
                                    <p><strong>Location:</strong> {order.shops.location}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Order Information</h4>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
                                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p><strong>Total:</strong> ${calculateOrderTotal(order.order_items).toFixed(2)}</p>
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
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.status === 'pending' && (
                          <>
                            <ApproveOrderDialog
                              orderId={order.id}
                              onApprove={(orderId, deliveryEstimate) =>
                                updateOrderStatus(orderId, 'approved', deliveryEstimate)
                              }
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'rejected')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {order.status === 'approved' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                            >
                              <Truck className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Print Order</DialogTitle>
                                </DialogHeader>
                                <div>
                                  <PrintableOrder ref={componentRef} order={order} />
                                </div>
                                <div className='flex justify-end gap-2'>
                                  <Button onClick={handleDownloadPdf}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                  </Button>
                                  <Button onClick={handlePrint}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

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
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrders;