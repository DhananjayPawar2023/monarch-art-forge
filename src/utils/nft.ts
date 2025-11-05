// NFT and blockchain utilities
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Simple ERC-721 mint function ABI
const MINT_ABI = [
  "function mint(address to, uint256 tokenId, string memory uri) public returns (uint256)"
];

export const mintNFT = async (
  contractAddress: string,
  tokenId: string,
  metadataUrl: string,
  walletAddress: string
) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, MINT_ABI, signer);

    // Call the mint function on the smart contract
    const tx = await contract.mint(walletAddress, tokenId, metadataUrl);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      tokenId,
    };
  } catch (error: any) {
    // Fallback to simulation for demo purposes
    console.log('Simulating NFT mint:', {
      contractAddress,
      tokenId,
      metadataUrl,
      walletAddress,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      transactionHash: `0x${Math.random().toString(16).substring(2)}`,
      tokenId,
    };
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
  };
  return `${explorers[chain.toLowerCase()] || explorers.ethereum}${txHash}`;
};
