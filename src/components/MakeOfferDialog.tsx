import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, MessageSquare } from 'lucide-react';

interface MakeOfferDialogProps {
  artworkId: string;
  sellerId: string;
  currentPriceUsd?: number;
  trigger?: React.ReactNode;
}

const MakeOfferDialog = ({ artworkId, sellerId, currentPriceUsd, trigger }: MakeOfferDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make an offer",
        variant: "destructive",
      });
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid offer amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      const { error } = await supabase.from('offers').insert({
        artwork_id: artworkId,
        buyer_id: user.id,
        seller_id: sellerId,
        offer_amount_usd: parseFloat(offerAmount),
        offer_amount_eth: parseFloat(offerAmount) / 3000, // Simplified ETH conversion
        message: message.trim() || null,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Offer submitted!",
        description: "Your offer has been sent to the seller",
      });

      setOpen(false);
      setOfferAmount('');
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Failed to submit offer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Make Offer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for this artwork. The seller will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-amount">Offer Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="offer-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter your offer"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            {currentPriceUsd && (
              <p className="text-sm text-muted-foreground">
                Current price: ${currentPriceUsd.toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Offer Expiry</Label>
            <select
              id="expiry"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                placeholder="Add a message to the seller..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pl-9 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferDialog;
