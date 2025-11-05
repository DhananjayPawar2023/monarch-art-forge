// Cryptocurrency payment utilities
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const processCryptoPayment = async (
  recipientAddress: string,
  amountEth: number,
  walletAddress: string
): Promise<{ transactionHash: string; success: boolean }> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Convert ETH to Wei
    const amountWei = ethers.parseEther(amountEth.toString());

    // Send transaction
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountWei,
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      transactionHash: receipt?.hash || tx.hash,
      success: true,
    };
  } catch (error: any) {
    console.error('Crypto payment error:', error);
    throw new Error(error.message || 'Payment failed');
  }
};

export const getWalletBalance = async (address: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return '0';
  }
};

export const getCurrentChainId = async (): Promise<number> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  return Number(network.chainId);
};

export const switchToChain = async (chainId: number): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // Chain not added to MetaMask
    if (error.code === 4902) {
      throw new Error('Please add this network to MetaMask');
    }
    throw error;
  }
};
