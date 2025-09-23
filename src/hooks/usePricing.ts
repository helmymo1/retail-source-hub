import { useMemo } from 'react';

interface Product {
  id: string;
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

export const getPrice = (product: Product, quantity: number) => {
  if (quantity >= 100) return product.price_100;
  if (quantity >= 50) return product.price_50;
  if (quantity >= 10) return product.price_10;
  return product.price_1;
};

export const usePricing = (cart: CartItem[]) => {
  const pricingDetails = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => {
      const price = getPrice(item.product, item.quantity);
      return acc + price * item.quantity;
    }, 0);

    const isSpecialDiscountEligible =
      cart.length === 10 && cart.every(item => item.quantity === 10);

    let discount = 0;
    if (isSpecialDiscountEligible) {
      discount = subtotal * 0.10; // 10% discount
    }

    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      total,
      discountApplied: isSpecialDiscountEligible,
    };
  }, [cart]);

  return pricingDetails;
};
