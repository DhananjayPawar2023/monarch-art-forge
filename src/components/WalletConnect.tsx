import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const WalletConnect = () => {
  const { user, connectWallet } = useAuth();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    const isEmbedded = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    if (isEmbedded) {
      toast({
        title: 'Wallet not available here',
        description: 'Wallet extensions usually do not work inside embedded previews. Open the app in a new tab to use MetaMask.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const address = accounts[0];
      setWalletAddress(address);

      if (user) {
        await connectWallet(address);
      }

      toast({
        title: "Wallet connected!",
        description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  if (walletAddress) {
    return (
      <Button variant="outline" className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4">
        <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="truncate max-w-[80px] sm:max-w-none">
          {walletAddress.slice(0, 4)}...{walletAddress.slice(-3)}
        </span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      variant="outline"
      className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 whitespace-nowrap"
    >
      <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect;
