import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Heart, UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FollowButtonProps {
  artistId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

const FollowButton = ({ artistId, variant = "outline", size = "default", showIcon = true }: FollowButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [user, artistId]);

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_follows')
        .select('id')
        .eq('follower_id', user?.id)
        .eq('artist_id', artistId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow artists.",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('artist_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('artist_id', artistId);

        if (error) throw error;
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You'll no longer receive updates from this artist.",
        });
      } else {
        const { error } = await supabase
          .from('artist_follows')
          .insert({
            follower_id: user.id,
            artist_id: artistId,
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({
          title: "Following!",
          description: "You'll receive updates when this artist releases new work.",
        });
      }
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

  return (
    <Button
      variant={isFollowing ? "default" : variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
    >
      {showIcon && (
        isFollowing ? (
          <UserCheck className="w-4 h-4 mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;