// NFT and blockchain utilities
import { ethers } from 'ethers';

// ERC-721 NFT Contract ABI
const ERC721_ABI = [
  "function mint(address to, string memory uri) public returns (uint256)",
  "function safeMint(address to, string memory uri) public returns (uint256)",
  "function setRoyaltyInfo(uint256 tokenId, address recipient, uint96 feeNumerator) public",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Default NFT contract addresses for different chains
export const NFT_CONTRACTS: Record<number, string> = {
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet - Replace with your contract
  5: '0x0000000000000000000000000000000000000000', // Goerli Testnet - Replace with your contract
  137: '0x0000000000000000000000000000000000000000', // Polygon - Replace with your contract
  80001: '0x0000000000000000000000000000000000000000', // Mumbai Testnet - Replace with your contract
};

export const mintNFT = async (
  contractAddress: string,
  metadataUrl: string,
  walletAddress: string,
  royaltyPercentage: number = 10
) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask to mint NFTs.');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Verify network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.chainId);
    
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);

    // Mint the NFT
    console.log('Minting NFT to:', walletAddress);
    const mintTx = await contract.safeMint(walletAddress, metadataUrl);
    console.log('Mint transaction sent:', mintTx.hash);
    
    const receipt = await mintTx.wait();
    console.log('Mint transaction confirmed:', receipt);

    // Extract token ID from Transfer event
    let tokenId = '0';
    if (receipt?.logs) {
      const transferEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      });
      
      if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        tokenId = parsed?.args?.tokenId?.toString() || '0';
      }
    }

    // Set royalty (EIP-2981 standard)
    if (royaltyPercentage > 0) {
      try {
        const royaltyFeeNumerator = Math.floor((royaltyPercentage * 10000) / 100); // Convert to basis points
        const royaltyTx = await contract.setRoyaltyInfo(tokenId, walletAddress, royaltyFeeNumerator);
        await royaltyTx.wait();
        console.log('Royalty info set:', royaltyPercentage + '%');
      } catch (royaltyError) {
        console.warn('Failed to set royalty info:', royaltyError);
      }
    }

    return {
      transactionHash: receipt?.hash || mintTx.hash,
      tokenId,
      blockNumber: receipt?.blockNumber,
    };
  } catch (error: any) {
    console.error('NFT minting error:', error);
    
    // Provide helpful error messages
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected. Please try again.');
    }
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds to cover gas fees. Please add funds to your wallet.');
    }
    
    throw new Error(error.message || 'Failed to mint NFT. Please try again.');
  }
};

export const uploadToIPFS = async (metadata: any) => {
  // Placeholder for IPFS upload
  // In production, this would use services like Pinata or NFT.Storage
  console.log('Uploading to IPFS:', metadata);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}`;
  return `ipfs://${mockCID}`;
};

export const generateMetadata = (artwork: {
  title: string;
  description: string;
  artistName: string;
  imageUrl: string;
  attributes?: Record<string, any>;
}) => {
  return {
    name: artwork.title,
    description: artwork.description,
    image: artwork.imageUrl,
    artist: artwork.artistName,
    attributes: [
      ...(artwork.attributes
        ? Object.entries(artwork.attributes).map(([trait_type, value]) => ({
            trait_type,
            value,
          }))
        : []),
    ],
  };
};

export const getChainName = (chainId: number): string => {
  const chains: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
  };
  return chains[chainId] || 'Unknown Chain';
};

export const getBlockExplorerUrl = (
  chain: string,
  txHash: string
): string => {
  const explorers: Record<string, string> = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    goerli: 'https://goerli.etherscan.io/tx/',
    mumbai: 'https://mumbai.polygonscan.com/tx/',
    base: 'https://basescan.org/tx/',
    'base-sepolia': 'https://sepolia.basescan.org/tx/',
  };
  const key = chain.toLowerCase();
  const baseUrl = explorers[key] || explorers.ethereum;
  return `${baseUrl}${txHash}`;
};

export const getOpenSeaAssetUrl = (
  chain: string,
  contractAddress: string,
  tokenId: string
): string => {
  const networks: Record<string, string> = {
    ethereum: 'https://opensea.io/assets/ethereum/',
    polygon: 'https://opensea.io/assets/matic/',
    base: 'https://opensea.io/assets/base/',
  };
  const key = chain.toLowerCase();
  const baseUrl = networks[key] || networks.ethereum;
  return `${baseUrl}${contractAddress}/${tokenId}`;
};
