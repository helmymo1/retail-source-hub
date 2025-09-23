import React from 'react';
import { Badge } from '@/components/ui/badge';

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

interface PrintableOrderProps {
  order: Order;
}

export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(({ order }, ref) => {
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

  return (
    <div ref={ref} className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Details</h1>
        <div className="flex justify-between">
          <div>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shop Details</h2>
          <p><strong>Name:</strong> {order.shops.name}</p>
          <p><strong>Owner:</strong> {order.shops.profiles.full_name}</p>
          <p><strong>Phone:</strong> {order.shops.profiles.phone}</p>
          <p><strong>Location:</strong> {order.shops.location}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Product</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.products.code}</td>
                <td className="py-2">{item.products.name}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                <td className="text-right py-2">${item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right mt-4 text-xl font-bold">
          Total: ${calculateOrderTotal(order.order_items).toFixed(2)}
        </div>
      </div>
    </div>
  );
});
