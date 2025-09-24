import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getPrice } from '@/hooks/usePricing';

interface Product {
  id: string;
  code: string;
  name: string;
  price_1: number;
  price_10: number;
  price_50: number;
  price_100: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  total: number;
  discountApplied: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

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
      title: "Added to Inquiry",
      description: `${quantity} × ${product.name} added to inquiry`,
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

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = getPrice(item.product, item.quantity);
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const { total, discount, discountApplied } = useMemo(() => {
    let newTotal = subtotal;
    let newDiscount = 0;
    let newDiscountApplied = false;

    if (subtotal > 5000) {
      newDiscount = subtotal * 0.1;
      newTotal = subtotal - newDiscount;
      newDiscountApplied = true;
    } else if (subtotal > 2000) {
      newDiscount = subtotal * 0.05;
      newTotal = subtotal - newDiscount;
      newDiscountApplied = true;
    }

    return { total: newTotal, discount: newDiscount, discountApplied: newDiscountApplied };
  }, [subtotal]);

  const value = {
    cart,
    addToCart,
    updateCartQuantity,
    clearCart,
    cartCount,
    subtotal,
    discount,
    total,
    discountApplied,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
