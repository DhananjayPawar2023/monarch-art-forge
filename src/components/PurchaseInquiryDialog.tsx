import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PurchaseInquiryDialogProps {
  artworkId: string;
  artworkTitle: string;
}

const PurchaseInquiryDialog = ({ artworkId, artworkTitle }: PurchaseInquiryDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit an inquiry.",
      });
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('purchase_inquiries')
        .insert({
          artwork_id: artworkId,
          user_id: user.id,
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string || null,
          message: formData.get('message') as string,
        });

      if (error) throw error;
      
      setSubmitted(true);
      toast({
        title: "Inquiry submitted",
        description: "We'll get back to you soon about this artwork.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Inquire About This Piece
        </Button>
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <DialogTitle className="mb-2">Inquiry Sent</DialogTitle>
            <DialogDescription>
              Thank you for your interest in "{artworkTitle}". Our team will review your inquiry and respond within 24-48 hours.
            </DialogDescription>
            <Button className="mt-6" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Inquiry</DialogTitle>
              <DialogDescription>
                Interested in "{artworkTitle}"? Fill out this form and our team will get in touch with you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  required
                  placeholder="Tell us about your interest in this piece..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInquiryDialog;