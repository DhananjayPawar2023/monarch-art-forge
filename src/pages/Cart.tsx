import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const { items, removeFromCart, totalPriceUsd } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Shopping Cart" description="View your cart" />
        <Header />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-4xl font-serif font-medium mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Start exploring our curated collection</p>
            <Link to="/explore">
              <Button size="lg">Explore Artworks</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Shopping Cart" description="Review your selected artworks" />
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium mb-8 sm:mb-12">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.artworkId} className="flex gap-3 sm:gap-6 pb-6 border-b border-border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 sm:w-32 sm:h-32 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-medium mb-1 sm:mb-2 truncate">{item.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-4">{item.artistName}</p>
                    <p className="text-base sm:text-lg font-medium">${item.priceUsd.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.artworkId)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="border border-border p-8 space-y-6 sticky top-32">
                <h2 className="text-2xl font-serif font-medium">Order Summary</h2>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPriceUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-medium pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${totalPriceUsd.toLocaleString()}</span>
                  </div>
                </div>
                
                <Link to="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link to="/explore" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
