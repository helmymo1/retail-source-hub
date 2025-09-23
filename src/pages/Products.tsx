import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, Package, Plus, Minus } from 'lucide-react';

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isBusinessOwner, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (code, name)
        `)
        .order('code');

      if (error) throw error;

      setProducts(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map(p => p.categories.code) || [])
      );
      setCategories(uniqueCategories);
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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categories.code === selectedCategory);

  const getPrice = (product: Product, quantity: number) => {
    if (quantity >= 100) return product.price_100;
    if (quantity >= 50) return product.price_50;
    if (quantity >= 10) return product.price_10;
    return product.price_1;
  };

  const addToCart = (product: Product, quantity: number) => {
    if (quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity, product }];
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} added to cart`,
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const price = getPrice(item.product, item.quantity);
      return total + (price * item.quantity);
    }, 0);
  };

  const submitOrder = async () => {
    if (!user || cart.length === 0) return;

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
          total_amount: getTotalAmount(),
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
        description: "Your order has been submitted for review",
      });

      setCart([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">Please sign in to browse products</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Products</h1>
              <p className="text-muted-foreground">Browse and order wholesale products</p>
            </div>
            <div className="flex items-center gap-4">
              {isBusinessOwner && cart.length > 0 && (
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                  <div className="text-lg font-bold">${getTotalAmount().toFixed(2)}</div>
                </div>
              )}
              <Button variant="outline" asChild>
                <Link to={isAdmin ? "/dashboard" : isBusinessOwner ? "/dashboard" : "/"}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                Category {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  canOrder={isBusinessOwner}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'No products available yet' 
                    : `No products in category ${selectedCategory}`}
                </p>
              </div>
            )}
          </div>

          {/* Cart */}
          {isBusinessOwner && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Cart ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.productId} className="border border-border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.product.code}</h4>
                              <p className="text-xs text-muted-foreground">{item.product.name}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-semibold">
                                ${(getPrice(item.product, item.quantity) * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ${getPrice(item.product, item.quantity)} each
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-12 text-center text-sm">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">${getTotalAmount().toFixed(2)}</span>
                        </div>
                        <Button onClick={submitOrder} className="w-full">
                          Submit Order
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  canOrder: boolean;
}

const ProductCard = ({ product, onAddToCart, canOrder }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="font-mono">
            {product.code}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {product.categories.name}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="text-xs font-medium">1 piece</div>
            <div className="font-semibold">${product.price_1}</div>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="text-xs font-medium">10+ pieces</div>
            <div className="font-semibold">${product.price_10}</div>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="text-xs font-medium">50+ pieces</div>
            <div className="font-semibold">${product.price_50}</div>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded">
            <div className="text-xs font-medium">100+ pieces</div>
            <div className="font-semibold">${product.price_100}</div>
          </div>
        </div>
        
        {canOrder && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Button
              onClick={() => onAddToCart(product, quantity)}
              className="flex-1"
              size="sm"
            >
              Add to Cart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Products;