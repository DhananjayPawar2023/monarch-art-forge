import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WalletConnect from '@/components/WalletConnect';

const Checkout = () => {
  const { items, totalPriceUsd, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [processing, setProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: user?.email || '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to complete your purchase",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setProcessing(true);

    try {
      for (const item of items) {
        const orderNumber = `MG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { error } = await supabase.from('orders').insert({
          user_id: user.id,
          artwork_id: item.artworkId,
          payment_method: paymentMethod,
          amount_usd: item.priceUsd,
          buyer_email: shippingInfo.email,
          order_number: orderNumber,
          payment_status: 'pending',
          shipping_address: shippingInfo,
        });

        if (error) throw error;
      }

      clearCart();
      toast({
        title: "Order placed!",
        description: "Your order has been received and is being processed",
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Checkout" description="Complete your purchase" />
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-serif font-medium mb-12">Checkout</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-serif font-medium">Shipping Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        required
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        required
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-serif font-medium">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <div className="flex items-center space-x-3 border border-border p-4 rounded-lg">
                      <RadioGroupItem value="crypto" id="crypto" />
                      <Label htmlFor="crypto" className="flex-1 cursor-pointer flex items-center gap-3">
                        <Wallet className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Cryptocurrency</p>
                          <p className="text-sm text-muted-foreground">Pay with ETH via MetaMask</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border p-4 rounded-lg opacity-50">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Credit Card</p>
                          <p className="text-sm text-muted-foreground">Stripe integration coming soon</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'crypto' && (
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <p className="text-sm">Connect your wallet to complete the purchase:</p>
                      <WalletConnect />
                    </div>
                  )}
                </section>
              </div>
              
              <div className="lg:col-span-1">
                <div className="border border-border p-8 space-y-6 sticky top-32">
                  <h2 className="text-2xl font-serif font-medium">Order Summary</h2>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.artworkId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.title}</span>
                        <span>${item.priceUsd.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xl font-medium pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${totalPriceUsd.toLocaleString()}</span>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full" disabled={processing}>
                    {processing ? 'Processing...' : 'Complete Purchase'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
