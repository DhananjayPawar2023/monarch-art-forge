import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, ExternalLink } from "lucide-react";
import { ethers } from "ethers";

interface MintNFTDialogProps {
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  artistAddress?: string;
}

const MintNFTDialog = ({ artworkId, artworkTitle, artworkImage, artistAddress }: MintNFTDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [chain, setChain] = useState<"base" | "ethereum">("base");

  const TRANSIENT_LABS_CONTRACT = {
    base: "0x...", // Add Transient Labs contract address for Base
    ethereum: "0x...", // Add Transient Labs contract address for Ethereum
  };

  const handleMint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mint NFTs.",
      });
      return;
    }

    setMinting(true);
    try {
      // Check if user has MetaMask
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to mint NFTs.");
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const userAddress = accounts[0];

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get network
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Check if on correct chain
      const expectedChainId = chain === "base" ? 8453 : 1;
      if (chainId !== expectedChainId) {
        // Switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            throw new Error(`Please add ${chain === "base" ? "Base" : "Ethereum"} network to MetaMask.`);
          }
          throw switchError;
        }
      }

      const formData = new FormData(e.currentTarget);
      const royaltyPercentage = Number(formData.get('royalty')) || 10;
      const editionSize = Number(formData.get('editions')) || 1;

      // Prepare metadata
      const metadata = {
        name: artworkTitle,
        description: `Artwork by ${artistAddress || 'Unknown Artist'}`,
        image: artworkImage,
        attributes: [
          { trait_type: "Artist", value: artistAddress || 'Unknown' },
          { trait_type: "Edition Size", value: editionSize.toString() },
        ]
      };

      // Upload metadata to IPFS (simplified - you'd use a proper IPFS service)
      // For production, integrate with services like NFT.Storage or Pinata
      const metadataJSON = JSON.stringify(metadata);
      
      // Transient Labs minting (simplified)
      // You'll need to integrate with their actual contract and methods
      // This is a placeholder showing the structure
      
      const contractAddress = TRANSIENT_LABS_CONTRACT[chain];
      const contractABI = [
        "function mint(address to, string memory uri, uint256 editions, uint256 royalty) public returns (uint256)"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Mock URI - replace with actual IPFS hash
      const tokenURI = `ipfs://QmYourIPFSHash/${artworkId}`;
      
      // Mint the NFT
      const tx = await contract.mint(
        artistAddress || userAddress,
        tokenURI,
        editionSize,
        royaltyPercentage * 100 // Convert to basis points (10% = 1000)
      );

      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
      });

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      // Update artwork in database
      await supabase
        .from('artworks')
        .update({
          is_nft: true,
          chain: chain,
          contract_address: contractAddress,
          token_id: receipt.logs[0]?.topics[1] || '', // Extract token ID from event
          royalty_percentage: royaltyPercentage,
        })
        .eq('id', artworkId);

      setMintSuccess(true);
      toast({
        title: "NFT Minted Successfully!",
        description: `Your NFT has been minted on ${chain === "base" ? "Base" : "Ethereum"}.`,
      });
    } catch (error: any) {
      console.error("Minting error:", error);
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setMintSuccess(false);
      setTxHash("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Sparkles className="w-4 h-4 mr-2" />
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent>
        {mintSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="mb-2">NFT Minted!</DialogTitle>
            <DialogDescription className="mb-4">
              Your artwork has been successfully minted as an NFT.
            </DialogDescription>
            {txHash && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mx-auto"
              >
                <a
                  href={`https://${chain === "base" ? "basescan.org" : "etherscan.io"}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on {chain === "base" ? "Basescan" : "Etherscan"}
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Mint NFT</DialogTitle>
              <DialogDescription>
                Mint "{artworkTitle}" as an NFT using Transient Labs
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMint} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="chain">Blockchain</Label>
                <Select value={chain} onValueChange={(val) => setChain(val as "base" | "ethereum")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base (Lower fees)</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editions">Edition Size</Label>
                <Input 
                  id="editions" 
                  name="editions" 
                  type="number" 
                  min="1" 
                  max="1000"
                  defaultValue="1"
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  Number of NFT copies to mint (1 for unique)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty Percentage</Label>
                <Input 
                  id="royalty" 
                  name="royalty" 
                  type="number" 
                  min="0" 
                  max="20"
                  defaultValue="10"
                  step="0.5"
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  Percentage earned on secondary sales (max 20%)
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Important:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• This will mint on {chain === "base" ? "Base" : "Ethereum"} network</li>
                  <li>• You'll need ETH for gas fees</li>
                  <li>• Metadata will be stored on IPFS</li>
                  <li>• Transaction is irreversible</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={minting}>
                {minting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mint NFT
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MintNFTDialog;
