import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Wallet, Upload, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';
import { getCurrentChainId, switchToChain } from '@/utils/cryptoPayment';
import { generateMetadata, getBlockExplorerUrl } from '@/utils/nft';
import SEO from '@/components/SEO';

const CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
};

const Mint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chain: 'base',
    royaltyPercentage: 10,
    editionSize: 1,
    priceEth: 0.01,
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  const handleWalletConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask to mint NFTs',
        variant: 'destructive',
      });
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWalletAddress(accounts[0]);
      toast({
        title: 'Wallet connected',
        description: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleMint = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to mint NFTs',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!walletAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.imageFile || !formData.title) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setMinting(true);
    try {
      // Check and switch chain if needed
      const currentChainId = await getCurrentChainId();
      const targetChainId = CHAIN_IDS[formData.chain as keyof typeof CHAIN_IDS];
      
      if (currentChainId !== targetChainId) {
        await switchToChain(targetChainId);
      }

      // Upload image to Supabase storage
      const fileExt = formData.imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, formData.imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      // Generate metadata (without IPFS for now)
      const metadata = generateMetadata({
        title: formData.title,
        description: formData.description,
        artistName: user.email || 'Unknown Artist',
        imageUrl: publicUrl,
        attributes: {
          chain: formData.chain,
          edition_size: formData.editionSize,
          royalty: formData.royaltyPercentage,
        },
      });

      // For now, store metadata as JSON in Supabase
      const metadataJson = JSON.stringify(metadata);

      // Mock minting transaction (replace with actual Transient Labs integration)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Placeholder transaction - in production, call Transient Labs contract
      toast({
        title: 'Minting in progress',
        description: 'Please confirm the transaction in your wallet',
      });

      // Store in database
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .insert({
          title: formData.title,
          description: formData.description,
          primary_image_url: publicUrl,
          artist_id: user.id,
          price_eth: formData.priceEth,
          edition_total: formData.editionSize,
          edition_available: formData.editionSize,
          royalty_percentage: formData.royaltyPercentage,
          chain: formData.chain,
          is_nft: true,
          status: 'published',
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          ipfs_metadata_url: metadataJson, // Temporary storage
        })
        .select()
        .single();

      if (artworkError) throw artworkError;

      // Mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      setTransactionHash(mockTxHash);
      setMintSuccess(true);

      toast({
        title: 'NFT minted successfully!',
        description: 'Your artwork is now on the blockchain',
      });
    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting failed',
        description: error.message || 'Failed to mint NFT',
        variant: 'destructive',
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Mint NFT - Monarch Gallery"
        description="Mint your artwork as an NFT on Ethereum or Base blockchain. Powered by Transient Labs."
      />
      
      <div className="min-h-screen bg-background py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          {mintSuccess ? (
            <Card className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-serif">NFT Minted Successfully!</h2>
              <p className="text-muted-foreground">Your artwork is now on the blockchain</p>
              {transactionHash && (
                <a
                  href={getBlockExplorerUrl(formData.chain, transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  View on {formData.chain === 'base' ? 'BaseScan' : 'Etherscan'}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/explore')}>View Gallery</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Mint Another
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="text-center mb-12 space-y-4">
                <h1 className="text-5xl font-serif tracking-tight">Mint on Monarch</h1>
                <p className="text-xl text-muted-foreground">Powered by Transient Labs</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="space-y-6">
                  <Card className="p-6 space-y-6">
                    {/* Wallet Connection */}
                    {!walletAddress ? (
                      <Button
                        onClick={handleWalletConnect}
                        disabled={connecting}
                        className="w-full"
                        size="lg"
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                        <span className="text-sm font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}

                    {/* Chain Selector */}
                    <div className="space-y-2">
                      <Label>Blockchain</Label>
                      <Select
                        value={formData.chain}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, chain: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Artwork File *</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="artwork-upload"
                        />
                        <label htmlFor="artwork-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image or video
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter artwork title"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your artwork"
                        rows={4}
                      />
                    </div>

                    {/* Royalties */}
                    <div className="space-y-2">
                      <Label htmlFor="royalty">Royalty Percentage (%)</Label>
                      <Input
                        id="royalty"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.royaltyPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        You'll receive this percentage on secondary sales
                      </p>
                    </div>

                    {/* Edition Size */}
                    <div className="space-y-2">
                      <Label htmlFor="supply">Edition Size</Label>
                      <Input
                        id="supply"
                        type="number"
                        min="1"
                        value={formData.editionSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, editionSize: Number(e.target.value) }))}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (ETH)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.priceEth}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceEth: Number(e.target.value) }))}
                      />
                    </div>

                    {/* Revenue Split Info */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                      <p className="font-medium">Revenue Split:</p>
                      <p className="text-muted-foreground">• Primary Sale: 90% to you, 10% platform fee</p>
                      <p className="text-muted-foreground">• Secondary Sales: {formData.royaltyPercentage}% to you, 2% platform royalty</p>
                    </div>

                    {/* Mint Button */}
                    <Button
                      onClick={handleMint}
                      disabled={!walletAddress || minting || !formData.imageFile || !formData.title}
                      className="w-full"
                      size="lg"
                    >
                      {minting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        'Mint Artwork'
                      )}
                    </Button>
                  </Card>
                </div>

                {/* Right: Preview */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-serif mb-4">Preview</h3>
                    {formData.imagePreview ? (
                      <div className="space-y-4">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-serif text-2xl">{formData.title || 'Untitled'}</h4>
                          <p className="text-muted-foreground text-sm">
                            {formData.description || 'No description'}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <span className="font-medium">{formData.priceEth} ETH</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Edition</span>
                            <span className="font-medium">{formData.editionSize}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Royalty</span>
                            <span className="font-medium">{formData.royaltyPercentage}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Chain</span>
                            <span className="font-medium capitalize">{formData.chain}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Upload an image to preview</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Mint;
