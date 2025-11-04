import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  artworkId: string;
  title: string;
  artistName: string;
  image: string;
  priceUsd: number;
  priceEth?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPriceUsd: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    if (items.find(i => i.artworkId === item.artworkId)) {
      toast({
        title: "Already in cart",
        description: "This artwork is already in your cart",
        variant: "destructive",
      });
      return;
    }
    
    setItems([...items, item]);
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart`,
    });
  };

  const removeFromCart = (artworkId: string) => {
    setItems(items.filter(i => i.artworkId !== artworkId));
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems: items.length,
    totalPriceUsd: items.reduce((sum, item) => sum + item.priceUsd, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
