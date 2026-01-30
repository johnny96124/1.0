/**
 * Chain Utilities - Unified helper functions for blockchain networks
 * 
 * Supported chains:
 * - Ethereum (ETH)
 * - Tron (TRX)
 * - Solana (SOL)
 * - BNB Chain (BNB)
 */

import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';

/**
 * Get chain full name (e.g., "Ethereum", "BNB Chain")
 */
export function getChainName(chainId: ChainId): string {
  return SUPPORTED_CHAINS.find(c => c.id === chainId)?.name || chainId;
}

/**
 * Get chain short name (e.g., "ETH", "BNB")
 */
export function getChainShortName(chainId: ChainId): string {
  return SUPPORTED_CHAINS.find(c => c.id === chainId)?.shortName || chainId;
}

/**
 * Get chain label for address book and compact displays
 * Uses full chain names instead of abbreviations
 */
export function getChainLabel(chainId: ChainId): string {
  if (chainId === 'ethereum' || chainId === 'bsc') return 'EVM';
  if (chainId === 'tron') return 'Tron';
  if (chainId === 'solana') return 'Solana';
  return getChainName(chainId);
}

/**
 * Validate address format for a specific chain
 */
export function validateAddress(address: string, chainId: ChainId): boolean {
  if (!address) return false;
  
  // EVM chains (Ethereum, BSC)
  if (chainId === 'ethereum' || chainId === 'bsc') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Tron
  if (chainId === 'tron') {
    return /^T[a-zA-Z0-9]{33}$/.test(address);
  }
  
  // Solana (Base58, 32-44 characters)
  if (chainId === 'solana') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  
  return false;
}

/**
 * Get address placeholder text for input fields
 */
export function getAddressPlaceholder(chainId: ChainId): string {
  if (chainId === 'tron') return 'T...';
  if (chainId === 'solana') return 'Base58 地址...';
  return '0x...';
}

/**
 * Get the gas/fee token for a specific chain
 */
export function getGasToken(chainId: ChainId): string {
  switch (chainId) {
    case 'ethereum': return 'ETH';
    case 'bsc': return 'BNB';
    case 'tron': return 'TRX';
    case 'solana': return 'SOL';
    default: return chainId.toUpperCase();
  }
}

/**
 * Check if a chain supports EVM (Ethereum Virtual Machine)
 */
export function isEVMChain(chainId: ChainId): boolean {
  return chainId === 'ethereum' || chainId === 'bsc';
}
