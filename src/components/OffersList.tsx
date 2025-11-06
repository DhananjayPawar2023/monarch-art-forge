import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Offer {
  id: string;
  offer_amount_usd: number;
  offer_amount_eth: number;
  status: string;
  message: string;
  expires_at: string;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface OffersListProps {
  artworkId: string;
  sellerId: string;
  onOfferAccepted?: () => void;
}

const OffersList = ({ artworkId, sellerId, onOfferAccepted }: OffersListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.id === sellerId;

  useEffect(() => {
    fetchOffers();
  }, [artworkId, user]);

  const fetchOffers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for each offer
      const offersWithProfiles = await Promise.all(
        (data || []).map(async (offer) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', offer.buyer_id)
            .single();

          return {
            ...offer,
            profiles: profile || { full_name: '', avatar_url: '' },
          };
        })
      );

      setOffers(offersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Offer accepted!",
        description: "The buyer will be notified. Please coordinate payment details.",
      });

      fetchOffers();
      onOfferAccepted?.();
    } catch (error: any) {
      toast({
        title: "Failed to accept offer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'rejected' })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Offer rejected",
        description: "The buyer has been notified.",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Failed to reject offer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'cancelled' })
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Offer cancelled",
        description: "Your offer has been cancelled.",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Failed to cancel offer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'outline',
      cancelled: 'outline',
    };

    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading offers...</div>;
  }

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No offers yet. Be the first to make an offer!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {isOwner ? 'Offers Received' : 'Your Offers'}
      </h3>
      {offers.map((offer) => (
        <Card key={offer.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  {offer.profiles?.avatar_url ? (
                    <img
                      src={offer.profiles.avatar_url}
                      alt={offer.profiles.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {offer.profiles?.full_name || 'Anonymous'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(offer.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold">${offer.offer_amount_usd.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {offer.offer_amount_eth?.toFixed(4)} ETH
              </div>
            </div>

            {offer.message && (
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm">{offer.message}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Expires: {new Date(offer.expires_at).toLocaleDateString()}
            </div>

            {offer.status === 'pending' && (
              <div className="flex gap-2">
                {isOwner ? (
                  <>
                    <Button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="flex-1 gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRejectOffer(offer.id)}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleCancelOffer(offer.id)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel Offer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OffersList;
