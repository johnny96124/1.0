/**
 * Mock Address Generator
 * Generates realistic-looking blockchain addresses for demo purposes
 * 
 * Address formats:
 * - Ethereum/BSC: 0x + 40 hex chars (42 total)
 * - Tron: T + 33 base58 chars (34 total)
 * - Solana: 32-44 base58 chars (typically 44)
 */

// Base58 character set (no 0, O, I, l)
const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Generate random hex string of specified length
function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Generate random base58 string of specified length
function randomBase58(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE58_CHARS[Math.floor(Math.random() * BASE58_CHARS.length)];
  }
  return result;
}

/**
 * Generate a realistic Ethereum/BSC address
 * Format: 0x + 40 lowercase hex characters
 */
export function generateEthAddress(): string {
  return `0x${randomHex(40)}`;
}

/**
 * Generate a realistic Tron address
 * Format: T + 33 base58 characters (34 total)
 */
export function generateTronAddress(): string {
  return `T${randomBase58(33)}`;
}

/**
 * Generate a realistic Solana address
 * Format: 44 base58 characters (typical length)
 */
export function generateSolanaAddress(): string {
  return randomBase58(44);
}

/**
 * Generate addresses for all supported chains
 */
export function generateMultiChainAddresses() {
  return {
    all: '',
    ethereum: generateEthAddress(),
    tron: generateTronAddress(),
    bsc: generateEthAddress(),
    solana: generateSolanaAddress(),
  };
}

// Pre-defined realistic addresses for consistent mock data
// These look like real addresses but are randomly generated for demo
export const MOCK_WALLET_ADDRESSES = {
  wallet1: {
    all: '',
    ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
    tron: 'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
    bsc: '0x8B3392483BA26D65E331dB86D4F430E9B3814E5e',
    solana: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
  },
  wallet2: {
    all: '',
    ethereum: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    tron: 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8',
    bsc: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    solana: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  },
  wallet3: {
    all: '',
    ethereum: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    tron: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    bsc: '0x2B5634C42055806a59e9107ED44D43c426E58258',
    solana: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  },
};

// Mock counterparty addresses for transactions
export const MOCK_COUNTERPARTY_ADDRESSES = {
  ethereum: [
    '0x1234567890abcdef1234567890abcdef12345678',
    '0x7a3F9c2B8e4D1f5A6b3C9e8D7f2A1b4C5d6E7f8A',
    '0xDEF456789012345678901234567890abcdef5678',
    '0xABC789DEF012345678901234567890abcdef1234',
  ],
  tron: [
    'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
    'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8',
    'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
  ],
  bsc: [
    '0xBSC8B3392483BA26D65E331dB86D4F430E9B3814',
    '0xBnb1f9840a85d5aF5bf1D1762F925BDADdC42012',
  ],
  solana: [
    '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    '3Kz9Xm8vNqW2yR5tP7uJ4mL6nB8cD0fG1hI2jK4lM5nO',
  ],
};

// PSP provider addresses
export const MOCK_PSP_ADDRESSES = {
  payglobal: {
    ethereum: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    tron: 'TPbBpRXkoxJdQVCLt7jfmCEXXZJxr1ySfL',
  },
  fastpay: {
    ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    bsc: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
};
