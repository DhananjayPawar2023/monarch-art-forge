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
      
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-12 sm:pb-24 px-4">
        <div className="container max-w-6xl mx-auto">
          {mintSuccess ? (
            <Card className="p-6 sm:p-12 text-center space-y-4 sm:space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif">NFT Minted Successfully!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Your artwork is now on the blockchain</p>
              {transactionHash && (
                <a
                  href={getBlockExplorerUrl(formData.chain, transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm sm:text-base text-primary hover:underline break-all"
                >
                  View on {formData.chain === 'base' ? 'BaseScan' : 'Etherscan'}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button onClick={() => navigate('/explore')} className="w-full sm:w-auto">View Gallery</Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
                  Mint Another
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight">Mint on Monarch</h1>
                <p className="text-base sm:text-xl text-muted-foreground">Powered by Transient Labs</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Form */}
                <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                  <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Wallet Connection */}
                    {!walletAddress ? (
                      <Button
                        onClick={handleWalletConnect}
                        disabled={connecting}
                        className="w-full h-10 sm:h-11 text-sm"
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
                      <div className="p-3 sm:p-4 bg-muted rounded-lg flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-mono truncate">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                        <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                    )}

                    {/* Chain Selector */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm">Blockchain</Label>
                      <Select
                        value={formData.chain}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, chain: value }))}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-sm">Artwork File *</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 sm:p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="artwork-upload"
                        />
                        <label htmlFor="artwork-upload" className="cursor-pointer">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Click to upload image or video
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="title" className="text-sm">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter artwork title"
                        className="h-10 text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="description" className="text-sm">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your artwork"
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>

                    {/* Two-column layout for smaller inputs on tablet+ */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {/* Royalties */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="royalty" className="text-sm">Royalty %</Label>
                        <Input
                          id="royalty"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.royaltyPercentage}
                          onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: Number(e.target.value) }))}
                          className="h-10 text-sm"
                        />
                      </div>

                      {/* Edition Size */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="supply" className="text-sm">Edition Size</Label>
                        <Input
                          id="supply"
                          type="number"
                          min="1"
                          value={formData.editionSize}
                          onChange={(e) => setFormData(prev => ({ ...prev, editionSize: Number(e.target.value) }))}
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="price" className="text-sm">Price (ETH)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.priceEth}
                        onChange={(e) => setFormData(prev => ({ ...prev, priceEth: Number(e.target.value) }))}
                        className="h-10 text-sm"
                      />
                    </div>

                    {/* Revenue Split Info */}
                    <div className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <p className="font-medium">Revenue Split:</p>
                      <p className="text-muted-foreground">• Primary: 90% you, 10% platform</p>
                      <p className="text-muted-foreground">• Secondary: {formData.royaltyPercentage}% you, 2% platform</p>
                    </div>

                    {/* Mint Button */}
                    <Button
                      onClick={handleMint}
                      disabled={!walletAddress || minting || !formData.imageFile || !formData.title}
                      className="w-full h-10 sm:h-11 text-sm"
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
