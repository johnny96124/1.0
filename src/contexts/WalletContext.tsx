import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { 
  Wallet, Asset, Transaction, Contact, Device, 
  SecurityConfig, BackupStatus, WalletStatus, WalletState,
  RiskColor, ChainId, AggregatedAsset, UserInfo, LimitStatus,
  PSPProvider, PSPConnection, PSPConnectionStatus,
  AccountRiskStatus, AccountRiskSummary, Notification,
  AuthResult, UserType
} from '@/types/wallet';
import { 
  MOCK_WALLET_ADDRESSES, 
  MOCK_PSP_ADDRESSES,
  generateMultiChainAddresses 
} from '@/lib/mock-addresses';

// Mock data for demonstration - wallet-specific assets
// Each wallet has its own assets
const mockAssetsWallet1: Asset[] = [
  // Ethereum chain
  { symbol: 'USDT', name: 'Tether USD', balance: 8500.50, usdValue: 8500.50, change24h: 0.01, icon: 'USDT', network: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 3230.00, usdValue: 3230.00, change24h: 0.00, icon: 'USDC', network: 'ethereum' },
  { symbol: 'ETH', name: 'Ethereum', balance: 2.45, usdValue: 8575.00, change24h: 2.34, icon: 'ETH', network: 'ethereum' },
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.125, usdValue: 12187.50, change24h: 1.85, icon: 'BTC', network: 'ethereum' },
  { symbol: 'LINK', name: 'Chainlink', balance: 150, usdValue: 2775.00, change24h: 1.9, icon: 'LINK', network: 'ethereum' },
  // Tron chain
  { symbol: 'USDT', name: 'Tether USD', balance: 2500.00, usdValue: 2500.00, change24h: 0.01, icon: 'USDT', network: 'tron' },
  { symbol: 'TRX', name: 'Tron', balance: 5000, usdValue: 550.00, change24h: -1.2, icon: 'TRX', network: 'tron' },
  // BSC chain
  { symbol: 'USDT', name: 'Tether USD', balance: 1580.00, usdValue: 1580.00, change24h: 0.01, icon: 'USDT', network: 'bsc' },
  { symbol: 'BNB', name: 'BNB', balance: 3.5, usdValue: 2100.00, change24h: 1.5, icon: 'BNB', network: 'bsc' },
  // Solana chain
  { symbol: 'SOL', name: 'Solana', balance: 12.5, usdValue: 2312.50, change24h: 3.2, icon: 'SOL', network: 'solana' },
  { symbol: 'USDT', name: 'Tether USD', balance: 1000.00, usdValue: 1000.00, change24h: 0.01, icon: 'USDT', network: 'solana' },
  { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, usdValue: 1500.00, change24h: 0.00, icon: 'USDC', network: 'solana' },
  // Other
  { symbol: 'MATIC', name: 'Polygon', balance: 2500, usdValue: 1300.00, change24h: 2.8, icon: 'MATIC', network: 'ethereum' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 5000, usdValue: 1900.00, change24h: 5.2, icon: 'DOGE', network: 'bsc' },
];

const mockAssetsWallet2: Asset[] = [
  // Ethereum chain - different balances for business wallet
  { symbol: 'USDT', name: 'Tether USD', balance: 25000.00, usdValue: 25000.00, change24h: 0.01, icon: 'USDT', network: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 15000.00, usdValue: 15000.00, change24h: 0.00, icon: 'USDC', network: 'ethereum' },
  { symbol: 'ETH', name: 'Ethereum', balance: 5.8, usdValue: 20300.00, change24h: 2.34, icon: 'ETH', network: 'ethereum' },
  // Tron chain
  { symbol: 'USDT', name: 'Tether USD', balance: 8000.00, usdValue: 8000.00, change24h: 0.01, icon: 'USDT', network: 'tron' },
  { symbol: 'TRX', name: 'Tron', balance: 12000, usdValue: 1320.00, change24h: -1.2, icon: 'TRX', network: 'tron' },
  // BSC chain
  { symbol: 'BNB', name: 'BNB', balance: 8.2, usdValue: 4920.00, change24h: 1.5, icon: 'BNB', network: 'bsc' },
];

// Mock assets for wallet-3 (escaped/self-custody wallet)
const mockAssetsWallet3: Asset[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: 1.85, usdValue: 6475.00, change24h: 2.34, icon: 'ETH', network: 'ethereum' },
  { symbol: 'USDT', name: 'Tether USD', balance: 4200.00, usdValue: 4200.00, change24h: 0.01, icon: 'USDT', network: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, usdValue: 1500.00, change24h: 0.00, icon: 'USDC', network: 'ethereum' },
  { symbol: 'BNB', name: 'BNB', balance: 2.3, usdValue: 1380.00, change24h: 1.5, icon: 'BNB', network: 'bsc' },
  { symbol: 'USDT', name: 'Tether USD', balance: 800.00, usdValue: 800.00, change24h: 0.01, icon: 'USDT', network: 'tron' },
  { symbol: 'USDC', name: 'USD Coin', balance: 800.00, usdValue: 800.00, change24h: 0.00, icon: 'USDC', network: 'solana' },
];

// Mock assets for newly created wallets - with sample balances for testing
const mockAssetsNewWallet: Asset[] = [
  // Ethereum chain
  { symbol: 'USDT', name: 'Tether USD', balance: 5000.00, usdValue: 5000.00, change24h: 0.01, icon: 'USDT', network: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 2000.00, usdValue: 2000.00, change24h: 0.00, icon: 'USDC', network: 'ethereum' },
  { symbol: 'ETH', name: 'Ethereum', balance: 1.5, usdValue: 5250.00, change24h: 2.34, icon: 'ETH', network: 'ethereum' },
  // Tron chain
  { symbol: 'USDT', name: 'Tether USD', balance: 3000.00, usdValue: 3000.00, change24h: 0.01, icon: 'USDT', network: 'tron' },
  { symbol: 'TRX', name: 'Tron', balance: 8000, usdValue: 880.00, change24h: -1.2, icon: 'TRX', network: 'tron' },
  // BSC chain
  { symbol: 'USDT', name: 'Tether USD', balance: 1200.00, usdValue: 1200.00, change24h: 0.01, icon: 'USDT', network: 'bsc' },
  { symbol: 'BNB', name: 'BNB', balance: 2.0, usdValue: 1200.00, change24h: 1.5, icon: 'BNB', network: 'bsc' },
  // Solana chain
  { symbol: 'SOL', name: 'Solana', balance: 5.0, usdValue: 925.00, change24h: 3.2, icon: 'SOL', network: 'solana' },
  { symbol: 'USDT', name: 'Tether USD', balance: 800.00, usdValue: 800.00, change24h: 0.01, icon: 'USDT', network: 'solana' },
  { symbol: 'USDC', name: 'USD Coin', balance: 1200.00, usdValue: 1200.00, change24h: 0.00, icon: 'USDC', network: 'solana' },
];

// Wallet ID to assets mapping
const walletAssetsMap: Record<string, Asset[]> = {
  'wallet-1': mockAssetsWallet1,
  'wallet-2': mockAssetsWallet2,
  'wallet-3': mockAssetsWallet3,
};

// Helper to get assets for a wallet
export const getAssetsForWallet = (walletId: string): Asset[] => {
  return walletAssetsMap[walletId] || mockAssetsNewWallet;
};

// Helper to get total balance for a wallet
export const getWalletTotalBalance = (walletId: string): number => {
  const assets = getAssetsForWallet(walletId);
  return assets.reduce((sum, a) => sum + a.usdValue, 0);
};

// Mock transactions per wallet (with risk data for testing)
const mockTransactionsWallet1: Transaction[] = [
  // Pending send transaction on Ethereum - RBF enabled
  {
    id: 'pending-eth-1',
    type: 'send',
    amount: 1,
    symbol: 'ETH',
    usdValue: 3500,
    status: 'pending',
    counterparty: '0x7a3F9c2B8e4D1f5A6b3C9e8D7f2A1b4C5d6E7f8A',
    counterpartyLabel: '',
    timestamp: new Date(),
    txHash: '0x17f65d9a2b3c4e5f6a7b8c9d0e1f2a3b4c5d6e7917af',
    network: 'ethereum',
    fee: 2.5,
    gasPrice: 2.5,
    gasAmount: 0.00072,
    gasToken: 'ETH',
    nonce: 42,
    isRbfEnabled: true,
    riskScore: 'green',
  },
  // Pending send transaction on BSC - RBF enabled
  {
    id: 'pending-bsc-1',
    type: 'send',
    amount: 500,
    symbol: 'USDT',
    usdValue: 500,
    status: 'pending',
    counterparty: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    counterpartyLabel: 'Exchange Wallet',
    timestamp: new Date(Date.now() - 300000), // 5 mins ago
    txHash: '0xbsc17f65d9a2b3c4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    network: 'bsc',
    fee: 0.5,
    gasPrice: 0.5,
    gasAmount: 0.0012,
    gasToken: 'BNB',
    nonce: 15,
    isRbfEnabled: true,
    riskScore: 'green',
  },
  {
    id: '1',
    type: 'receive',
    amount: 2500,
    symbol: 'USDT',
    usdValue: 2500,
    status: 'confirmed',
    counterparty: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    counterpartyLabel: 'ABC Trading Co.',
    timestamp: new Date(Date.now() - 3600000),
    txHash: '0xabc123def456789012345678901234567890abcdef',
    network: 'ethereum',
    riskScore: 'green',
    confirmations: 156,
    blockHeight: 19234567,
    fee: 3.2,
    gasAmount: 0.00091,
    gasToken: 'ETH',
    nonce: 38,
    memo: '货款结算 - 订单号 #20240115',
  },
  {
    id: '2',
    type: 'send',
    amount: 800,
    symbol: 'USDT',
    usdValue: 800,
    status: 'confirmed',
    counterparty: 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8',
    counterpartyLabel: 'Supplier XYZ',
    timestamp: new Date(Date.now() - 86400000),
    txHash: 'abc123def456789012345678901234567890',
    network: 'tron',
    fee: 2.5,
    gasAmount: 22.5,
    gasToken: 'TRX',
    nonce: 25,
    riskScore: 'green',
    confirmations: 1250,
    blockHeight: 58912345,
  },
  // High risk incoming transaction 1
  {
    id: 'risk-1',
    type: 'receive',
    amount: 15000,
    symbol: 'USDT',
    usdValue: 15000,
    status: 'confirmed',
    counterparty: '0x8B3392483BA26D65E331dB86D4F430E9B3814E5e',
    timestamp: new Date(Date.now() - 7200000),
    txHash: '0xrisktx123456789012345678901234567890abcd',
    network: 'ethereum',
    riskScore: 'red',
    riskReasons: ['与 OFAC 制裁名单地址有关联', '历史交易涉及混币器服务'],
    riskScanTime: new Date(Date.now() - 7100000),
    disposalStatus: 'pending',
  },
  // High risk incoming transaction 2
  {
    id: 'risk-3',
    type: 'receive',
    amount: 8500,
    symbol: 'ETH',
    usdValue: 29750,
    status: 'confirmed',
    counterparty: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    timestamp: new Date(Date.now() - 5400000),
    txHash: '0xhighrisk789012345678901234567890abcdef',
    network: 'ethereum',
    riskScore: 'red',
    riskReasons: ['与暗网市场相关地址有直接交互', '多层混淆交易路径', '涉及已知诈骗案件'],
    riskScanTime: new Date(Date.now() - 5300000),
    disposalStatus: 'pending',
  },
  // Suspicious incoming transaction 1
  {
    id: 'risk-2',
    type: 'receive',
    amount: 5000,
    symbol: 'USDC',
    usdValue: 5000,
    status: 'confirmed',
    counterparty: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    timestamp: new Date(Date.now() - 1800000),
    txHash: '0xsuspicious1234567890abcdef1234567890ab',
    network: 'ethereum',
    riskScore: 'yellow',
    riskReasons: ['新地址，交易历史有限', '资金来源链路较短'],
    riskScanTime: new Date(Date.now() - 1700000),
    disposalStatus: 'pending',
  },
  // Suspicious incoming transaction 2
  {
    id: 'risk-4',
    type: 'receive',
    amount: 3200,
    symbol: 'USDT',
    usdValue: 3200,
    status: 'confirmed',
    counterparty: '0x2B5634C42055806a59e9107ED44D43c426E58258',
    counterpartyLabel: '未知来源',
    timestamp: new Date(Date.now() - 4800000),
    txHash: '0xyellowrisk456789012345678901234567890',
    network: 'bsc',
    riskScore: 'yellow',
    riskReasons: ['首次与该地址交互', '交易模式异常'],
    riskScanTime: new Date(Date.now() - 4700000),
    disposalStatus: 'pending',
  },
  // Already acknowledged risk transaction
  {
    id: 'risk-5',
    type: 'receive',
    amount: 1200,
    symbol: 'USDT',
    usdValue: 1200,
    status: 'confirmed',
    counterparty: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    timestamp: new Date(Date.now() - 259200000),
    txHash: '0xacknowledged123456789012345678901234567',
    network: 'tron',
    riskScore: 'yellow',
    riskReasons: ['资金来源不明'],
    riskScanTime: new Date(Date.now() - 259100000),
    disposalStatus: 'acknowledged',
  },
  // Already returned risk transaction
  {
    id: 'risk-6',
    type: 'receive',
    amount: 25000,
    symbol: 'USDC',
    usdValue: 25000,
    status: 'confirmed',
    counterparty: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    timestamp: new Date(Date.now() - 345600000),
    txHash: '0xreturned789012345678901234567890abcdef',
    network: 'ethereum',
    riskScore: 'red',
    riskReasons: ['与恐怖融资相关地址有关联'],
    riskScanTime: new Date(Date.now() - 345500000),
    disposalStatus: 'returned',
    disposalTxHash: '0xreturnhash123456789012345678901234567',
  },
  {
    id: '4',
    type: 'send',
    amount: 1.5,
    symbol: 'BNB',
    usdValue: 900,
    status: 'confirmed',
    counterparty: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    timestamp: new Date(Date.now() - 172800000),
    txHash: '0xbnbtx123456789012345678901234567890abcd',
    network: 'bsc',
    fee: 0.001,
    riskScore: 'green',
  },
  {
    id: '5',
    type: 'receive',
    amount: 500,
    symbol: 'TRX',
    usdValue: 55,
    status: 'confirmed',
    counterparty: 'TPbBpRXkoxJdQVCLt7jfmCEXXZJxr1ySfL',
    counterpartyLabel: '日常收款',
    timestamp: new Date(Date.now() - 432000000),
    txHash: 'trxtx123456789012345678901234567890abcd',
    network: 'tron',
    riskScore: 'green',
  },
  // Failed transaction 1 - insufficient gas (today)
  {
    id: 'failed-1',
    type: 'send',
    amount: 1000,
    symbol: 'USDT',
    usdValue: 1000,
    status: 'failed',
    counterparty: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    counterpartyLabel: 'External Wallet',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    txHash: '0xfailedtx1234567890abcdef1234567890abcd',
    network: 'ethereum',
    fee: 0,
    riskScore: 'green',
    failureReason: 'Gas 不足：交易执行时余额不足以支付网络费用',
    nonce: 45,
  },
  // Failed transaction 2 - network error (today)
  {
    id: 'failed-2',
    type: 'send',
    amount: 2.5,
    symbol: 'ETH',
    usdValue: 8750,
    status: 'failed',
    counterparty: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    txHash: '0xfailedtx2345678901234567890abcdef12345',
    network: 'ethereum',
    fee: 0,
    riskScore: 'green',
    failureReason: '执行失败：合约调用时发生 revert，可能是目标地址拒绝接收',
    nonce: 44,
  },
  // Failed transaction 3 - on Tron network (yesterday)
  {
    id: 'failed-3',
    type: 'send',
    amount: 500,
    symbol: 'USDT',
    usdValue: 500,
    status: 'failed',
    counterparty: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    counterpartyLabel: 'Partner Ltd.',
    timestamp: new Date(Date.now() - 90000000), // ~1 day ago
    txHash: 'failedhash789012345678901234567890abcd',
    network: 'tron',
    fee: 0,
    riskScore: 'green',
    failureReason: '能量不足：TRX 余额不足以提供交易所需的能量',
    nonce: 12,
  },
];

const mockTransactionsWallet2: Transaction[] = [
  {
    id: 'biz-1',
    type: 'receive',
    amount: 15000,
    symbol: 'USDT',
    usdValue: 15000,
    status: 'confirmed',
    counterparty: '0xCorp...8888',
    counterpartyLabel: 'Corporate Client A',
    timestamp: new Date(Date.now() - 7200000),
    txHash: '0xbiz1...hash',
    network: 'ethereum',
    riskScore: 'green',
  },
  {
    id: 'biz-2',
    type: 'send',
    amount: 5000,
    symbol: 'USDT',
    usdValue: 5000,
    status: 'confirmed',
    counterparty: 'T8Biz...Tron',
    counterpartyLabel: 'Partner Company',
    timestamp: new Date(Date.now() - 43200000),
    txHash: 'tronbiz...hash',
    network: 'tron',
    fee: 5.0,
    riskScore: 'green',
  },
  {
    id: 'biz-3',
    type: 'receive',
    amount: 3.5,
    symbol: 'ETH',
    usdValue: 12250,
    status: 'confirmed',
    counterparty: '0xVend...or99',
    counterpartyLabel: 'Vendor Payment',
    timestamp: new Date(Date.now() - 259200000),
    txHash: '0xeth...vendor',
    network: 'ethereum',
    riskScore: 'green',
  },
];

// Mock transactions for wallet-3 (self-custody wallet)
const mockTransactionsWallet3: Transaction[] = [
  {
    id: 'self-1',
    type: 'receive',
    amount: 1.85,
    symbol: 'ETH',
    usdValue: 6475,
    status: 'confirmed',
    counterparty: '0xABC123...DEF456',
    counterpartyLabel: '从 MPC 钱包转入',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    txHash: '0xself1...hash',
    network: 'ethereum',
    riskScore: 'green',
  },
  {
    id: 'self-2',
    type: 'receive',
    amount: 4200,
    symbol: 'USDT',
    usdValue: 4200,
    status: 'confirmed',
    counterparty: '0xABC123...DEF456',
    counterpartyLabel: '从 MPC 钱包转入',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    txHash: '0xself2...hash',
    network: 'ethereum',
    riskScore: 'green',
  },
  {
    id: 'self-3',
    type: 'send',
    amount: 500,
    symbol: 'USDT',
    usdValue: 500,
    status: 'confirmed',
    counterparty: '0xExch...ange',
    counterpartyLabel: 'Exchange Deposit',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    txHash: '0xself3...hash',
    network: 'ethereum',
    fee: 8.5,
    riskScore: 'green',
  },
  {
    id: 'self-4',
    type: 'receive',
    amount: 2.3,
    symbol: 'BNB',
    usdValue: 1380,
    status: 'confirmed',
    counterparty: '0xBSC...Addr',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    txHash: '0xbsc...hash',
    network: 'bsc',
    riskScore: 'green',
  },
];

// Wallet ID to transactions mapping
const walletTransactionsMap: Record<string, Transaction[]> = {
  'wallet-1': mockTransactionsWallet1,
  'wallet-2': mockTransactionsWallet2,
  'wallet-3': mockTransactionsWallet3,
};

// Helper to get transactions for a wallet
const getTransactionsForWallet = (walletId: string): Transaction[] => {
  return walletTransactionsMap[walletId] || [];
};

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'ABC Trading Co.',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    network: 'ethereum',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 3600000),
    notes: '长期合作客户',
  },
  {
    id: '2',
    name: 'Supplier XYZ',
    address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    network: 'tron',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    name: '',
    address: '0x7a3F9c2B8e4D1f5A6b3C9e8D7f2A1b4C5d6E7f8A',
    network: 'ethereum',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
  },
  {
    id: '4',
    name: 'BSC Partner',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    network: 'bsc',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 172800000),
  },
  // 新增5条测试数据 - 覆盖不同网络
  {
    id: '5',
    name: 'Solana DeFi Wallet',
    address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    network: 'solana',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 7200000),
    notes: 'Solana 主网钱包',
  },
  {
    id: '6',
    name: 'Tron 收款地址',
    address: 'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
    network: 'tron',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 14400000),
  },
  {
    id: '7',
    name: '',
    address: '0x2B5634C42055806a59e9107ED44D43c426E58258',
    network: 'bsc',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 259200000),
  },
  {
    id: '8',
    name: '合作方 A 公司财务部',
    address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    network: 'ethereum',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
    lastUsed: new Date(Date.now() - 432000000),
    notes: '每月结算使用',
  },
  {
    id: '9',
    name: 'SOL NFT Marketplace',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    network: 'solana',
    tags: [],
    isOfficial: false,
    isWhitelisted: false,
  },
];

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    model: 'iPhone15,3',
    lastActive: new Date(),
    location: '上海, 中国',
    isCurrent: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'MacBook Pro',
    model: 'MacBookPro18,1',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: '北京, 中国',
    isCurrent: false,
    status: 'active',
  },
  {
    id: '3',
    name: 'Windows PC',
    model: 'Windows',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    location: '杭州, 中国',
    isCurrent: false,
    status: 'active',
  },
  {
    id: '4',
    name: 'iPad Pro',
    model: 'iPad13,4',
    lastActive: new Date(Date.now() - 48 * 60 * 60 * 1000),
    location: '深圳, 中国',
    isCurrent: false,
    status: 'active',
  },
];

const defaultSecurityConfig: SecurityConfig = {
  singleTransactionLimit: 10000,
  dailyLimit: 50000,
  monthlyLimit: 200000,
  dailyUsed: 4500,
  monthlyUsed: 18000,
  lastDailyReset: new Date(),
  lastMonthlyReset: new Date(),
  requireSatoshiTest: true,
  whitelistBypass: false,
  highRiskAction: 'block',
};

const defaultBackupStatus: BackupStatus = {
  cloudBackup: false,
  fileBackup: false,
};

// Mock PSP data with addresses for transfer interception
const mockPSPConnections: PSPConnection[] = [
  {
    id: 'psp-conn-1',
    pspId: 'psp-1',
    psp: {
      id: 'psp-1',
      name: 'PayGlobal',
      logo: '',
      description: '全球领先的跨境支付服务商，提供安全、快速的支付解决方案',
      officialUrl: 'https://payglobal.example.com',
      isVerified: true,
      rating: 4.8,
      contact: {
        email: 'support@payglobal.com',
        phone: '+86 400-888-8888',
        supportUrl: 'https://payglobal.example.com/support',
      },
      feeConfig: {
        collection: 0.5,
        withdrawal: 1.0,
        transfer: 0.3,
        minWithdrawal: 100,
      },
      availableServices: ['collection', 'transfer', 'withdrawal', 'deposit'],
    },
    status: 'active',
    connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    permissions: {
      readBalance: true,
      readTransactions: true,
      collection: true,
      transfer: true,
      withdrawal: true,
    },
    stats: {
      totalTransactions: 156,
      totalVolume: 125000,
      lastTransactionAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    addresses: [
      { network: 'ethereum', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2' },
      { network: 'tron', address: 'TPbBpRXkoxJdQVCLt7jfmCEXXZJxr1ySfL' },
    ],
  },
  {
    id: 'psp-conn-2',
    pspId: 'psp-2',
    psp: {
      id: 'psp-2',
      name: 'FastPay Asia',
      logo: '',
      description: '亚太区领先的B2B支付解决方案提供商',
      officialUrl: 'https://fastpay.example.com',
      isVerified: true,
      rating: 4.5,
      contact: {
        email: 'contact@fastpay.com',
        phone: '+852 3000-8888',
      },
      feeConfig: {
        collection: 0.4,
        withdrawal: 0.8,
        transfer: 0.25,
        minWithdrawal: 50,
      },
      availableServices: ['collection', 'transfer', 'withdrawal', 'settlement'],
    },
    status: 'active',
    connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    permissions: {
      readBalance: true,
      readTransactions: true,
      collection: true,
      transfer: true,
      withdrawal: false,
    },
    stats: {
      totalTransactions: 42,
      totalVolume: 38500,
      lastTransactionAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    addresses: [
      { network: 'ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      { network: 'bsc', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
    ],
  },
  {
    id: 'psp-conn-4',
    pspId: 'psp-4',
    psp: {
      id: 'psp-4',
      name: 'CrossBorder Pay',
      logo: '',
      description: '专业跨境支付服务商，支持多币种结算',
      officialUrl: 'https://crossborderpay.example.com',
      isVerified: true,
      rating: 4.6,
      contact: {
        email: 'support@crossborderpay.com',
        phone: '+86 400-666-8888',
      },
      feeConfig: {
        collection: 0.6,
        withdrawal: 1.2,
        transfer: 0.35,
        minWithdrawal: 200,
      },
      availableServices: ['collection', 'transfer', 'withdrawal'],
    },
    status: 'pending',
    connectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    permissions: {
      readBalance: true,
      readTransactions: true,
      collection: true,
      transfer: true,
      withdrawal: true,
    },
    stats: {
      totalTransactions: 0,
      totalVolume: 0,
    },
  },
  {
    id: 'psp-conn-3',
    pspId: 'psp-3',
    psp: {
      id: 'psp-3',
      name: 'UniPay',
      logo: '',
      description: '一站式支付解决方案，支持多种支付方式',
      officialUrl: 'https://unipay.example.com',
      isVerified: true,
      rating: 4.3,
      contact: {
        email: 'support@unipay.com',
        phone: '+86 400-777-8888',
      },
      feeConfig: {
        collection: 0.55,
        withdrawal: 1.1,
        transfer: 0.3,
        minWithdrawal: 150,
      },
      availableServices: ['collection', 'transfer', 'withdrawal', 'deposit'],
    },
    status: 'rejected',
    connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    rejectionInfo: {
      reason: '提交的企业资质证明文件不清晰，请重新上传高清扫描件或照片',
      rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      canReapply: true,
      reapplyAfter: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    permissions: {
      readBalance: true,
      readTransactions: true,
      collection: true,
      transfer: true,
      withdrawal: true,
    },
    stats: {
      totalTransactions: 0,
      totalVolume: 0,
    },
  },
];

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'risk_inflow',
    category: 'security',
    priority: 'urgent',
    title: '检测到风险资金转入',
    content: '您的钱包收到一笔 2,500 USDT 的转账，经系统检测可能涉及高风险来源，请及时处理。',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    action: { label: '查看详情', route: '/risk-management' },
    metadata: { amount: 2500, symbol: 'USDT' },
  },
  {
    id: 'notif-2',
    type: 'new_device',
    category: 'security',
    priority: 'urgent',
    title: '新设备登录提醒',
    content: '您的账号在新设备 iPhone 15 Pro 上登录，位置：上海。如非本人操作，请立即处理。',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    action: { label: '管理设备', route: '/profile/devices' },
    metadata: { deviceId: 'device-4' },
  },
  {
    id: 'notif-3',
    type: 'transaction_in',
    category: 'transaction',
    priority: 'normal',
    title: '收到 500 USDT',
    content: '来自 0x1f98...F984 的转账已确认到账。',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: false,
    action: { label: '查看交易', route: '/history' },
    metadata: { amount: 500, symbol: 'USDT' },
  },
  {
    id: 'notif-4',
    type: 'psp_expiring',
    category: 'psp',
    priority: 'normal',
    title: 'PSP 授权即将到期',
    content: '您与 支付宝商户服务 的连接将在 7 天后到期，请及时续期以确保服务不中断。',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    action: { label: '立即续期', route: '/psp' },
    metadata: { pspId: 'psp-1' },
  },
  {
    id: 'notif-5',
    type: 'large_amount',
    category: 'transaction',
    priority: 'normal',
    title: '大额转账通知',
    content: '您发起的 10,000 USDT 转账已成功发送至 0xabcd...efgh。',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    action: { label: '查看交易', route: '/history' },
    metadata: { amount: 10000, symbol: 'USDT' },
  },
  {
    id: 'notif-6',
    type: 'system_update',
    category: 'system',
    priority: 'low',
    title: 'v2.1.0 版本更新',
    content: '新版本已发布，新增多链资产聚合显示、优化转账流程等功能。',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
  },
  {
    id: 'notif-7',
    type: 'maintenance',
    category: 'system',
    priority: 'normal',
    title: '系统维护通知',
    content: '系统将于 2026年1月25日 02:00-06:00 进行维护升级，届时部分功能可能暂时无法使用。',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isRead: true,
  },
  {
    id: 'notif-8',
    type: 'transaction_out',
    category: 'transaction',
    priority: 'normal',
    title: '转账成功',
    content: '向 0x9876...4321 转账 200 USDT 已成功。',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: true,
    action: { label: '查看交易', route: '/history' },
    metadata: { amount: 200, symbol: 'USDT' },
  },
];
export function aggregateAssets(assets: Asset[]): AggregatedAsset[] {
  const grouped = assets.reduce((acc, asset) => {
    if (!acc[asset.symbol]) {
      acc[asset.symbol] = {
        symbol: asset.symbol,
        name: asset.name,
        totalBalance: 0,
        totalUsdValue: 0,
        change24h: asset.change24h,
        icon: asset.icon,
        chains: [],
      };
    }
    acc[asset.symbol].totalBalance += asset.balance;
    acc[asset.symbol].totalUsdValue += asset.usdValue;
    acc[asset.symbol].chains.push({
      network: asset.network,
      balance: asset.balance,
      usdValue: asset.usdValue,
    });
    return acc;
  }, {} as Record<string, AggregatedAsset>);
  
  return Object.values(grouped).sort((a, b) => b.totalUsdValue - a.totalUsdValue);
}

interface WalletContextType extends WalletState {
  // Auth actions
  login: (provider: 'apple' | 'google' | 'email') => Promise<AuthResult>;
  logout: () => void;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<AuthResult>;
  checkPasswordExists: (email: string) => Promise<{ hasPassword: boolean; isNewUser: boolean }>;
  loginWithPassword: (email: string, password: string) => Promise<AuthResult>;
  
  // Wallet actions
  createWallet: (name: string) => Promise<Wallet>;
  switchWallet: (walletId: string) => void;
  renameWallet: (walletId: string, newName: string) => void;
  
  // Backup actions
  setPin: (pin: string) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  completeCloudBackup: (provider: 'icloud' | 'google_drive', password: string) => Promise<boolean>;
  completeFileBackup: (password: string) => Promise<boolean>;
  
  // Transaction actions
  sendTransaction: (to: string, amount: number, symbol: string, network: ChainId, memo?: string) => Promise<string>;
  scanAddressRisk: (address: string) => Promise<{ score: RiskColor; reasons: string[] }>;
  
  // Limit actions
  getLimitStatus: () => LimitStatus;
  checkTransferLimit: (amount: number) => { allowed: boolean; reason?: string };
  
  // Contact actions
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  
  // Device actions
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  
  // Asset actions
  addToken: (symbol: string, name: string, network: ChainId, price: number, change24h: number) => void;
  removeToken: (symbol: string, network?: ChainId) => void;
  
  // Security config
  updateSecurityConfig: (config: Partial<SecurityConfig>) => void;
  
  // Onboarding state
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  
  // PSP actions
  pspConnections: PSPConnection[];
  connectPSP: (psp: PSPProvider, permissions: Record<string, boolean>) => Promise<void>;
  disconnectPSP: (connectionId: string) => Promise<void>;
  suspendPSP: (connectionId: string) => Promise<void>;
  
  // Risk management actions
  getAccountRiskStatus: () => AccountRiskSummary;
  getRiskTransactions: () => Transaction[];
  returnRiskFunds: (txId: string) => Promise<{ txHash: string }>;
  acknowledgeRiskTx: (txId: string) => void;
  isPSPAddress: (address: string) => { isPSP: boolean; pspName?: string };
  
  // Notification actions
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // TSS Node actions
  hasTSSNode: boolean;
  tssNodeInfo: { hasCloudBackup: boolean; cloudProvider?: string; hasLocalBackup: boolean } | null;
  checkTSSNodeExists: () => Promise<{ exists: boolean; hasCloudBackup: boolean; cloudProvider?: string; hasLocalBackup: boolean }>;
  recoverTSSNode: (method: 'cloud' | 'local_file' | 'old_device', password?: string) => Promise<void>;
  createTSSNode: () => Promise<void>;
  
  // Dev mode
  devModeLogin: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(defaultSecurityConfig);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>(defaultBackupStatus);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('not_created');
  const [hasPin, setHasPin] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [pspConnections, setPspConnections] = useState<PSPConnection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Computed notification count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Mock user data - can be toggled for testing different user types
  const [mockIsNewUser] = useState(true); // Set to true to test new user flow

  const setupExistingUser = useCallback(() => {
    const mockUserInfo: UserInfo = {
      email: 'sarah.chen@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      nickname: 'Sarah Chen',
    };
    setUserInfo(mockUserInfo);
    
    const mockWallets: Wallet[] = [
      {
        id: 'wallet-1',
        name: '我的钱包',
        addresses: MOCK_WALLET_ADDRESSES.wallet1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isBackedUp: true,
        isBiometricEnabled: true,
        isEscaped: false,
        custodyType: 'mpc',
        backupInfo: {
          method: 'cloud',
          cloudProvider: 'icloud',
          lastBackupTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: 'wallet-2',
        name: '商务钱包',
        addresses: MOCK_WALLET_ADDRESSES.wallet2,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isBackedUp: true,
        isBiometricEnabled: false,
        isEscaped: false,
        custodyType: 'mpc',
        backupInfo: {
          method: 'cloud',
          cloudProvider: 'google_drive',
          lastBackupTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: 'wallet-3',
        name: '自托管钱包',
        addresses: MOCK_WALLET_ADDRESSES.wallet3,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isBackedUp: true,
        isBiometricEnabled: true,
        isEscaped: true,
        escapedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        custodyType: 'self',
        backupInfo: {
          method: 'file',
          fileBackupTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    ];
    
    setWallets(mockWallets);
    setCurrentWallet(mockWallets[0]);
    setAssets(getAssetsForWallet('wallet-1'));
    setTransactions(getTransactionsForWallet('wallet-1'));
    setContacts(mockContacts);
    setDevices(mockDevices);
    setWalletStatus('fully_secure');
    setHasPin(true);
    setHasBiometric(true);
    setPspConnections(mockPSPConnections);
  }, []);

  const sendVerificationCode = useCallback(async (email: string): Promise<void> => {
    // Simulate sending verification code
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Verification code sent to ${email}`);
    // In production, this would call an API to send the code
  }, []);

  // Check if user has set a password for the email
  const checkPasswordExists = useCallback(async (email: string): Promise<{ hasPassword: boolean; isNewUser: boolean }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: Users with specific email patterns have password set
    // In production, this would call an API to check
    const hasPassword = email.includes('test') || email.includes('demo') || !mockIsNewUser;
    const isNewUser = mockIsNewUser;
    
    return { hasPassword, isNewUser };
  }, [mockIsNewUser]);

  // Login with password
  const loginWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock: Accept any password with length >= 6 for testing
    if (password.length < 6) {
      throw new Error('密码错误');
    }

    setIsAuthenticated(true);

    if (mockIsNewUser) {
      const mockUserInfo: UserInfo = {
        email,
        nickname: email.split('@')[0],
      };
      setUserInfo(mockUserInfo);
      setWalletStatus('not_created');
      
      return {
        userType: 'new',
        isDeviceAuthorized: true,
        hasExistingWallets: false,
      };
    } else {
      setupExistingUser();
      
      return {
        userType: 'returning_with_wallet',
        isDeviceAuthorized: true,
        hasExistingWallets: true,
      };
    }
  }, [mockIsNewUser, setupExistingUser]);

  const verifyCode = useCallback(async (email: string, code: string): Promise<AuthResult> => {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock: Accept any 6-digit code for testing
    if (code.length !== 6) {
      throw new Error('Invalid code');
    }

    setIsAuthenticated(true);

    // Determine user type based on mockIsNewUser flag
    if (mockIsNewUser) {
      // New user - no wallets
      const mockUserInfo: UserInfo = {
        email,
        nickname: email.split('@')[0],
      };
      setUserInfo(mockUserInfo);
      setWalletStatus('not_created');
      
      return {
        userType: 'new',
        isDeviceAuthorized: true,
        hasExistingWallets: false,
      };
    } else {
      // Existing user with wallets
      setupExistingUser();
      
      return {
        userType: 'returning_with_wallet',
        isDeviceAuthorized: true,
        hasExistingWallets: true,
      };
    }
  }, [mockIsNewUser, setupExistingUser]);

  const login = useCallback(async (provider: 'apple' | 'google' | 'email'): Promise<AuthResult> => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAuthenticated(true);
    
    if (mockIsNewUser) {
      const mockUserInfo: UserInfo = {
        email: 'newuser@example.com',
        nickname: 'New User',
      };
      setUserInfo(mockUserInfo);
      setWalletStatus('not_created');
      
      return {
        userType: 'new',
        isDeviceAuthorized: true,
        hasExistingWallets: false,
      };
    } else {
      setupExistingUser();
      
      return {
        userType: 'returning_with_wallet',
        isDeviceAuthorized: true,
        hasExistingWallets: true,
      };
    }
  }, [mockIsNewUser, setupExistingUser]);

  // Dev mode login - instant login with existing user data for testing
  const devModeLogin = useCallback(() => {
    setIsAuthenticated(true);
    setupExistingUser();
  }, [setupExistingUser]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setCurrentWallet(null);
    setWallets([]);
    setAssets([]);
    setTransactions([]);
    setWalletStatus('not_created');
    setHasPin(false);
    setHasBiometric(false);
    setOnboardingStep(0);
    setPspConnections([]);
  }, []);

  const createWallet = useCallback(async (name: string): Promise<Wallet> => {
    // Simulate MPC key generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name,
      addresses: generateMultiChainAddresses(),
      createdAt: new Date(),
      isBackedUp: false,
      isBiometricEnabled: hasBiometric,
      isEscaped: false,
      custodyType: 'mpc',
    };
    
    // Register new wallet in the assets map with sample assets for testing
    walletAssetsMap[newWallet.id] = [...mockAssetsNewWallet];
    walletTransactionsMap[newWallet.id] = [];
    
    setWallets(prev => [...prev, newWallet]);
    setCurrentWallet(newWallet);
    setAssets(getAssetsForWallet(newWallet.id));
    setTransactions(getTransactionsForWallet(newWallet.id));
    setContacts(mockContacts);
    setDevices(mockDevices);
    setWalletStatus('created_no_backup');
    
    return newWallet;
  }, [hasBiometric]);

  const switchWallet = useCallback((walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setCurrentWallet(wallet);
      // Load wallet-specific assets and transactions
      setAssets(getAssetsForWallet(walletId));
      setTransactions(getTransactionsForWallet(walletId));
    }
  }, [wallets]);

  const renameWallet = useCallback((walletId: string, newName: string) => {
    setWallets(prev => prev.map(w => 
      w.id === walletId ? { ...w, name: newName } : w
    ));
    // If renaming current wallet, also update currentWallet
    if (currentWallet?.id === walletId) {
      setCurrentWallet(prev => prev ? { ...prev, name: newName } : null);
    }
  }, [currentWallet?.id]);

  const setPin = useCallback(async (pin: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setHasPin(true);
    return true;
  }, []);

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    // Simulate biometric enrollment
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasBiometric(true);
    return true;
  }, []);

  const completeCloudBackup = useCallback(async (provider: 'icloud' | 'google_drive', password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setBackupStatus({
      cloudBackup: true,
      cloudProvider: provider,
      lastBackupDate: new Date(),
      fileBackup: false,
    });
    
    if (currentWallet) {
      setCurrentWallet({ ...currentWallet, isBackedUp: true });
      setWallets(prev => prev.map(w => 
        w.id === currentWallet.id ? { ...w, isBackedUp: true } : w
      ));
    }
    
    setWalletStatus('fully_secure');
    return true;
  }, [currentWallet]);

  const completeFileBackup = useCallback(async (password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBackupStatus(prev => ({
      ...prev,
      fileBackup: true,
    }));
    
    if (!backupStatus.cloudBackup) {
      setWalletStatus('backup_complete');
    }
    
    return true;
  }, [backupStatus.cloudBackup]);

  const sendTransaction = useCallback(async (to: string, amount: number, symbol: string, network: ChainId, memo?: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const txHash = `0x${Math.random().toString(16).slice(2)}`;
    
    // Determine gas token and approximate gas amount based on network
    const gasConfig: Record<ChainId, { token: string; amount: number; feeUsd: number }> = {
      ethereum: { token: 'ETH', amount: 0.00072, feeUsd: 2.5 },
      tron: { token: 'TRX', amount: 22.5, feeUsd: 2.5 },
      bsc: { token: 'BNB', amount: 0.0012, feeUsd: 0.5 },
      solana: { token: 'SOL', amount: 0.00025, feeUsd: 0.05 },
      all: { token: 'ETH', amount: 0.00072, feeUsd: 2.5 },
    };
    
    const gas = gasConfig[network] || gasConfig.ethereum;
    
    // Find the asset to get USD value
    const asset = assets.find(a => a.symbol === symbol && a.network === network);
    const usdValue = asset ? (amount * asset.usdValue / asset.balance) : amount;
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      amount,
      symbol,
      usdValue,
      status: 'pending',
      counterparty: to,
      timestamp: new Date(),
      txHash,
      network,
      fee: gas.feeUsd,
      gasAmount: gas.amount,
      gasToken: gas.token,
      nonce: Math.floor(Math.random() * 100),
      isRbfEnabled: network !== 'tron' && network !== 'solana',
      memo,
      riskScore: 'green',
    };
    
    // Add transaction to wallet-specific map
    if (currentWallet) {
      if (!walletTransactionsMap[currentWallet.id]) {
        walletTransactionsMap[currentWallet.id] = [];
      }
      walletTransactionsMap[currentWallet.id] = [newTx, ...walletTransactionsMap[currentWallet.id]];
    }
    
    setTransactions(prev => [newTx, ...prev]);
    
    // Update balance
    setAssets(prev => prev.map(a => 
      (a.symbol === symbol && a.network === network) ? { ...a, balance: a.balance - amount, usdValue: a.usdValue - (amount * a.usdValue / a.balance) } : a
    ));
    
    return txHash;
  }, [assets, currentWallet]);

  const scanAddressRisk = useCallback(async (address: string): Promise<{ score: RiskColor; reasons: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate risk scanning
    const random = Math.random();
    if (random > 0.9) {
      return { score: 'red', reasons: ['Associated with known mixer service', 'Sanctioned entity connection'] };
    } else if (random > 0.7) {
      return { score: 'yellow', reasons: ['Limited transaction history', 'New address'] };
    }
    return { score: 'green', reasons: [] };
  }, []);

  const addContact = useCallback((contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setContacts(prev => [...prev, newContact]);
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const addDevice = useCallback((device: Device) => {
    setDevices(prev => [...prev, device]);
  }, []);

  const removeDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateSecurityConfig = useCallback((config: Partial<SecurityConfig>) => {
    setSecurityConfig(prev => ({ ...prev, ...config }));
  }, []);

  const addToken = useCallback((symbol: string, name: string, network: ChainId, price: number, change24h: number) => {
    // Check if token already exists on this network
    const exists = assets.some(a => a.symbol === symbol && a.network === network);
    if (exists) return;
    
    const newAsset: Asset = {
      symbol,
      name,
      balance: 0,
      usdValue: 0,
      change24h,
      icon: symbol,
      network,
    };
    setAssets(prev => [...prev, newAsset]);
  }, [assets]);

  const removeToken = useCallback((symbol: string, network?: ChainId) => {
    setAssets(prev => {
      if (network) {
        // Remove from specific network
        return prev.filter(a => !(a.symbol === symbol && a.network === network));
      }
      // Remove from all networks
      return prev.filter(a => a.symbol !== symbol);
    });
  }, []);

  const getLimitStatus = useCallback((): LimitStatus => {
    return {
      singleLimit: securityConfig.singleTransactionLimit,
      dailyLimit: securityConfig.dailyLimit,
      dailyUsed: securityConfig.dailyUsed,
      dailyRemaining: securityConfig.dailyLimit - securityConfig.dailyUsed,
      monthlyLimit: securityConfig.monthlyLimit,
      monthlyUsed: securityConfig.monthlyUsed,
      monthlyRemaining: securityConfig.monthlyLimit - securityConfig.monthlyUsed,
    };
  }, [securityConfig]);

  const checkTransferLimit = useCallback((amount: number): { allowed: boolean; reason?: string } => {
    if (amount > securityConfig.singleTransactionLimit) {
      return { allowed: false, reason: `超出单笔限额 $${securityConfig.singleTransactionLimit.toLocaleString()}` };
    }
    const dailyRemaining = securityConfig.dailyLimit - securityConfig.dailyUsed;
    if (amount > dailyRemaining) {
      return { allowed: false, reason: `超出今日剩余额度 $${dailyRemaining.toLocaleString()}` };
    }
    const monthlyRemaining = securityConfig.monthlyLimit - securityConfig.monthlyUsed;
    if (amount > monthlyRemaining) {
      return { allowed: false, reason: `超出本月剩余额度 $${monthlyRemaining.toLocaleString()}` };
    }
    return { allowed: true };
  }, [securityConfig]);

  // PSP actions
  const connectPSP = useCallback(async (psp: PSPProvider, permissions: Record<string, boolean>) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newConnection: PSPConnection = {
      id: `psp-conn-${Date.now()}`,
      pspId: psp.id,
      psp,
      status: 'active',
      connectedAt: new Date(),
      permissions: {
        readBalance: permissions.readBalance ?? true,
        readTransactions: permissions.readTransactions ?? true,
        collection: permissions.collection ?? true,
        transfer: permissions.transfer ?? true,
        withdrawal: permissions.withdrawal ?? true,
      },
      stats: { totalTransactions: 0, totalVolume: 0 },
    };
    setPspConnections(prev => [...prev, newConnection]);
  }, []);

  // Risk management methods
  const getAccountRiskStatus = useCallback((): AccountRiskSummary => {
    const riskTxs = transactions.filter(
      tx => tx.type === 'receive' && 
      (tx.riskScore === 'red' || tx.riskScore === 'yellow') &&
      tx.disposalStatus === 'pending'
    );
    
    const redCount = riskTxs.filter(tx => tx.riskScore === 'red').length;
    const yellowCount = riskTxs.filter(tx => tx.riskScore === 'yellow').length;
    const totalRiskExposure = riskTxs.reduce((sum, tx) => sum + tx.usdValue, 0);
    
    let status: AccountRiskStatus = 'healthy';
    if (redCount > 0) status = 'restricted';
    else if (yellowCount > 0) status = 'warning';
    
    return {
      status,
      pendingRiskCount: riskTxs.length,
      yellowCount,
      redCount,
      totalRiskExposure,
    };
  }, [transactions]);

  const getRiskTransactions = useCallback((): Transaction[] => {
    return transactions.filter(
      tx => tx.type === 'receive' && (tx.riskScore === 'red' || tx.riskScore === 'yellow')
    );
  }, [transactions]);

  const returnRiskFunds = useCallback(async (txId: string): Promise<{ txHash: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const txHash = `0x${Math.random().toString(16).slice(2)}`;
    
    setTransactions(prev => prev.map(tx =>
      tx.id === txId 
        ? { ...tx, disposalStatus: 'returned' as const, disposalTxHash: txHash, disposalTime: new Date() }
        : tx
    ));
    
    return { txHash };
  }, []);

  const acknowledgeRiskTx = useCallback((txId: string) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === txId 
        ? { ...tx, disposalStatus: 'acknowledged' as const, disposalTime: new Date() }
        : tx
    ));
  }, []);

  const isPSPAddress = useCallback((address: string): { isPSP: boolean; pspName?: string } => {
    for (const conn of pspConnections) {
      if (conn.addresses?.some(a => a.address.toLowerCase() === address.toLowerCase())) {
        return { isPSP: true, pspName: conn.psp.name };
      }
    }
    return { isPSP: false };
  }, [pspConnections]);

  const disconnectPSP = useCallback(async (connectionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setPspConnections(prev => prev.filter(c => c.id !== connectionId));
  }, []);

  const suspendPSP = useCallback(async (connectionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setPspConnections(prev => prev.map(c => 
      c.id === connectionId 
        ? { ...c, status: (c.status === 'suspended' ? 'active' : 'suspended') as PSPConnectionStatus }
        : c
    ));
  }, []);

  // TSS Node state and methods
  const [hasTSSNode, setHasTSSNode] = useState(true); // Mock: existing user has TSS Node
  const [tssNodeInfo, setTssNodeInfo] = useState<{ hasCloudBackup: boolean; cloudProvider?: string; hasLocalBackup: boolean } | null>({
    hasCloudBackup: true,
    cloudProvider: 'icloud',
    hasLocalBackup: false,
  });

  const checkTSSNodeExists = useCallback(async () => {
    // Mock: simulate checking server for existing TSS Node
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      exists: hasTSSNode,
      hasCloudBackup: tssNodeInfo?.hasCloudBackup ?? false,
      cloudProvider: tssNodeInfo?.cloudProvider,
      hasLocalBackup: tssNodeInfo?.hasLocalBackup ?? false,
    };
  }, [hasTSSNode, tssNodeInfo]);

  const recoverTSSNode = useCallback(async (method: 'cloud' | 'local_file' | 'old_device', password?: string) => {
    // Mock: simulate TSS Node recovery
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate recovery success
    setHasTSSNode(true);
  }, []);

  const createTSSNodeFn = useCallback(async () => {
    // Mock: simulate TSS Node creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setHasTSSNode(true);
    setTssNodeInfo({
      hasCloudBackup: false,
      hasLocalBackup: false,
    });
  }, []);

  const value = {
    isAuthenticated,
    userInfo,
    currentWallet,
    wallets,
    assets,
    transactions,
    contacts,
    devices,
    securityConfig,
    backupStatus,
    walletStatus,
    hasPin,
    hasBiometric,
    login,
    logout,
    sendVerificationCode,
    verifyCode,
    checkPasswordExists,
    loginWithPassword,
    createWallet,
    switchWallet,
    renameWallet,
    setPin,
    enableBiometric,
    completeCloudBackup,
    completeFileBackup,
    sendTransaction,
    scanAddressRisk,
    getLimitStatus,
    checkTransferLimit,
    addContact,
    updateContact,
    removeContact,
    addDevice,
    removeDevice,
    addToken,
    removeToken,
    updateSecurityConfig,
    onboardingStep,
    setOnboardingStep,
    pspConnections,
    connectPSP,
    disconnectPSP,
    suspendPSP,
    getAccountRiskStatus,
    getRiskTransactions,
    returnRiskFunds,
    acknowledgeRiskTx,
    isPSPAddress,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    // TSS Node
    hasTSSNode,
    tssNodeInfo,
    checkTSSNodeExists,
    recoverTSSNode,
    createTSSNode: createTSSNodeFn,
    // Dev mode
    devModeLogin,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
