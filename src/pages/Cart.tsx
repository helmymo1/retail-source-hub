import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePricing, getPrice } from '@/hooks/usePricing';
import { ArrowLeft, ShoppingCart, Package, Plus, Minus, Trash2, Send } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_1: number;
  price_10: number;
  price_50: number;
  price_100: number;
  categories: {
    code: string;
    name: string;
  };
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isBusinessOwner } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subtotal, discount, total, discountApplied } = usePricing(cart);

  useEffect(() => {
    // Load cart from localStorage on component mount
    const savedCart = localStorage.getItem('wholesale-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever cart changes
    localStorage.setItem('wholesale-cart', JSON.stringify(cart));
  }, [cart]);

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    toast({
      title: "Updated",
      description: "Cart updated successfully",
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    
    toast({
      title: "Removed",
      description: "Item removed from cart",
    });
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cleared",
      description: "Cart cleared successfully",
    });
  };

  const submitOrder = async () => {
    if (!user || cart.length === 0) return;

    setLoading(true);
    try {
      // Get user's shop
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .single();

      if (shopError || !shop) {
        toast({
          title: "Error",
          description: "No approved shop found for your account",
          variant: "destructive",
        });
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          shop_id: shop.id,
          total_amount: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: getPrice(item.product, item.quantity),
        total_price: getPrice(item.product, item.quantity) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Submitted",
        description: "Your order has been submitted for admin approval",
      });

      clearCart();
      navigate('/business/orders');
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

  if (!user || !isBusinessOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">Only business owners can access the cart</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            Review your items and submit your order
          </p>
        </div>

        {cart.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start adding products to your cart to place an order
              </p>
              <Button asChild>
                <Link to="/products">
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Cart Items ({cart.length})
                </h2>
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {cart.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {item.product.code}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {item.product.categories.name}
                              </span>
                            </div>
                            <h3 className="font-semibold">{item.product.name}</h3>
                            {item.product.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.product.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Pricing Info */}
                        <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                          <div className="text-center p-2 bg-accent/10 rounded">
                            <div className="font-semibold">1 pc</div>
                            <div>${item.product.price_1}</div>
                          </div>
                          <div className="text-center p-2 bg-accent/10 rounded">
                            <div className="font-semibold">10+ pcs</div>
                            <div>${item.product.price_10}</div>
                          </div>
                          <div className="text-center p-2 bg-accent/10 rounded">
                            <div className="font-semibold">50+ pcs</div>
                            <div>${item.product.price_50}</div>
                          </div>
                          <div className="text-center p-2 bg-accent/10 rounded">
                            <div className="font-semibold">100+ pcs</div>
                            <div>${item.product.price_100}</div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Quantity:</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              ${(getPrice(item.product, item.quantity) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${getPrice(item.product, item.quantity)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountApplied && (
                        <div className="flex justify-between text-primary">
                          <span>Volume Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={submitOrder} 
                      className="w-full" 
                      disabled={loading || cart.length === 0}
                    >
                      {loading ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Order
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Your order will be reviewed by admin before processing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;