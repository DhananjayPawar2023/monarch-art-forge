import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnect = () => {
  const { user, connectWallet } = useAuth();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
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
      <Button variant="outline" className="gap-2">
        <Wallet className="w-4 h-4" />
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={connecting}
      variant="outline"
      className="gap-2"
    >
      <Wallet className="w-4 h-4" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect;
