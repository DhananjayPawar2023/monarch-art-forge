import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, CreditCard, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WalletConnect from '@/components/WalletConnect';
import { processCryptoPayment, getWalletBalance } from '@/utils/cryptoPayment';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Checkout = () => {
  const { items, totalPriceUsd, totalPriceEth, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [processing, setProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: user?.email || '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  // Gallery wallet address for receiving payments (replace with actual address)
  const GALLERY_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (window.ethereum && paymentMethod === 'crypto') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const balance = await getWalletBalance(accounts[0]);
            setWalletBalance(balance);
          }
        } catch (error) {
          console.error('Error fetching wallet info:', error);
        }
      }
    };

    fetchWalletInfo();
  }, [paymentMethod]);

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

    if (paymentMethod === 'crypto' && !walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to pay with crypto",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      let transactionHash = '';

      // Process crypto payment
      if (paymentMethod === 'crypto' && walletAddress && totalPriceEth) {
        try {
          const payment = await processCryptoPayment(
            GALLERY_WALLET,
            totalPriceEth,
            walletAddress
          );
          transactionHash = payment.transactionHash;
        } catch (error: any) {
          throw new Error(`Crypto payment failed: ${error.message}`);
        }
      }

      // Create orders for each item
      for (const item of items) {
        const orderNumber = `MG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { error } = await supabase.from('orders').insert({
          user_id: user.id,
          artwork_id: item.artworkId,
          payment_method: paymentMethod,
          amount_usd: item.priceUsd,
          amount_crypto: item.priceEth?.toString(),
          currency: paymentMethod === 'crypto' ? 'ETH' : 'USD',
          buyer_email: shippingInfo.email,
          buyer_wallet_address: walletAddress,
          transaction_hash: transactionHash,
          order_number: orderNumber,
          payment_status: paymentMethod === 'crypto' ? 'completed' : 'pending',
          shipping_address: shippingInfo,
        });

        if (error) throw error;

        // Update artwork availability
        await supabase.rpc('decrement_edition_available', {
          artwork_id: item.artworkId
        });
      }

      clearCart();
      toast({
        title: "Purchase successful!",
        description: paymentMethod === 'crypto' 
          ? `Transaction: ${transactionHash.slice(0, 10)}...${transactionHash.slice(-8)}`
          : "Your order has been received",
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Purchase failed",
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium mb-8 sm:mb-12">Checkout</h1>
          
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
                      <p className="text-sm font-medium">Cryptocurrency Payment</p>
                      <WalletConnect />
                      {walletAddress && (
                        <>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">Wallet Balance: {parseFloat(walletBalance).toFixed(4)} ETH</p>
                            <p className="text-muted-foreground">Payment Amount: {totalPriceEth?.toFixed(4)} ETH</p>
                          </div>
                          {totalPriceEth && parseFloat(walletBalance) < totalPriceEth && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Insufficient balance. Please add more ETH to your wallet.
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      )}
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
                  
                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex justify-between text-xl font-medium">
                      <span>Total</span>
                      <span>${totalPriceUsd.toLocaleString()}</span>
                    </div>
                    {paymentMethod === 'crypto' && totalPriceEth && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>≈ {totalPriceEth.toFixed(4)} ETH</span>
                      </div>
                    )}
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
