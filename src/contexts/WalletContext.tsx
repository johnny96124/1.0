import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Wallet, Asset, Transaction, Contact, Device, 
  SecurityConfig, BackupStatus, WalletStatus, WalletState,
  RiskColor, ChainId, AggregatedAsset, UserInfo, LimitStatus,
  PSPProvider, PSPConnection, PSPConnectionStatus,
  AccountRiskStatus, AccountRiskSummary
} from '@/types/wallet';

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
  { symbol: 'SOL', name: 'Solana', balance: 12.5, usdValue: 2312.50, change24h: 3.2, icon: 'SOL', network: 'ethereum' },
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

// Mock assets for newly created wallets (empty)
const mockAssetsNewWallet: Asset[] = [];

// Wallet ID to assets mapping
const walletAssetsMap: Record<string, Asset[]> = {
  'wallet-1': mockAssetsWallet1,
  'wallet-2': mockAssetsWallet2,
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
  {
    id: '1',
    type: 'receive',
    amount: 2500,
    symbol: 'USDT',
    usdValue: 2500,
    status: 'confirmed',
    counterparty: '0x1234567890abcdef1234567890abcdef12345678',
    counterpartyLabel: 'ABC Trading Co.',
    timestamp: new Date(Date.now() - 3600000),
    txHash: '0xabc123def456789012345678901234567890abcdef',
    network: 'ethereum',
    riskScore: 'green',
  },
  {
    id: '2',
    type: 'send',
    amount: 800,
    symbol: 'USDT',
    usdValue: 800,
    status: 'confirmed',
    counterparty: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    counterpartyLabel: 'Supplier XYZ',
    timestamp: new Date(Date.now() - 86400000),
    txHash: 'abc123def456789012345678901234567890',
    network: 'tron',
    fee: 2.5,
    riskScore: 'green',
  },
  // High risk incoming transaction
  {
    id: 'risk-1',
    type: 'receive',
    amount: 15000,
    symbol: 'USDT',
    usdValue: 15000,
    status: 'confirmed',
    counterparty: '0xSANCTIONED123456789012345678901234567890',
    timestamp: new Date(Date.now() - 7200000),
    txHash: '0xrisktx123456789012345678901234567890abcd',
    network: 'ethereum',
    riskScore: 'red',
    riskReasons: ['与 OFAC 制裁名单地址有关联', '历史交易涉及混币器服务'],
    riskScanTime: new Date(Date.now() - 7100000),
    disposalStatus: 'pending',
  },
  // Suspicious incoming transaction
  {
    id: 'risk-2',
    type: 'receive',
    amount: 5000,
    symbol: 'USDC',
    usdValue: 5000,
    status: 'confirmed',
    counterparty: '0x9999888877776666555544443333222211110000',
    timestamp: new Date(Date.now() - 1800000),
    txHash: '0xsuspicious1234567890abcdef1234567890ab',
    network: 'ethereum',
    riskScore: 'yellow',
    riskReasons: ['新地址，交易历史有限', '资金来源链路较短'],
    riskScanTime: new Date(Date.now() - 1700000),
    disposalStatus: 'pending',
  },
  {
    id: '4',
    type: 'send',
    amount: 1.5,
    symbol: 'BNB',
    usdValue: 900,
    status: 'confirmed',
    counterparty: '0xBnb123456789012345678901234567890abcdef',
    timestamp: new Date(Date.now() - 172800000),
    txHash: '0xbnbtx123456789012345678901234567890abcd',
    network: 'bsc',
    fee: 0.001,
    riskScore: 'green',
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

// Wallet ID to transactions mapping
const walletTransactionsMap: Record<string, Transaction[]> = {
  'wallet-1': mockTransactionsWallet1,
  'wallet-2': mockTransactionsWallet2,
};

// Helper to get transactions for a wallet
const getTransactionsForWallet = (walletId: string): Transaction[] => {
  return walletTransactionsMap[walletId] || [];
};

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'ABC Trading Co.',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'ethereum',
    tags: ['Customer', 'Verified'],
    isOfficial: false,
    isWhitelisted: true,
    lastUsed: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    name: 'Supplier XYZ',
    address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    network: 'tron',
    tags: ['Supplier'],
    isOfficial: false,
    isWhitelisted: true,
    lastUsed: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    name: 'PSP Official Settlement',
    address: '0xOFFICIAL1234567890abcdef1234567890abcd',
    network: 'ethereum',
    tags: ['Official'],
    isOfficial: true,
    isWhitelisted: true,
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
      { network: 'ethereum', address: '0xPAYGLOBAL1234567890abcdef1234567890ab' },
      { network: 'tron', address: 'TPAYGLOBALxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
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
      { network: 'ethereum', address: '0xFASTPAY1234567890abcdef1234567890abcd' },
      { network: 'bsc', address: '0xFASTPAYBSC1234567890abcdef12345678ab' },
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

// Helper function to aggregate assets across chains
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
  login: (provider: 'apple' | 'google' | 'email') => Promise<void>;
  logout: () => void;
  
  // Wallet actions
  createWallet: (name: string) => Promise<Wallet>;
  switchWallet: (walletId: string) => void;
  
  // Backup actions
  setPin: (pin: string) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  completeCloudBackup: (provider: 'icloud' | 'google_drive', password: string) => Promise<boolean>;
  completeFileBackup: (password: string) => Promise<boolean>;
  
  // Transaction actions
  sendTransaction: (to: string, amount: number, symbol: string, memo?: string) => Promise<string>;
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

  const login = useCallback(async (provider: 'apple' | 'google' | 'email') => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAuthenticated(true);
    
    // Set user info based on login provider
    const mockUserInfo: UserInfo = {
      email: provider === 'google' ? 'user@gmail.com' : provider === 'apple' ? 'user@icloud.com' : 'user@example.com',
      avatar: undefined, // Can add avatar URL here
    };
    setUserInfo(mockUserInfo);
    
    // Simulate existing user with multiple wallets - login goes directly to home
    const mockWallets: Wallet[] = [
      {
        id: 'wallet-1',
        name: '我的钱包',
        addresses: {
          all: '',
          ethereum: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
          tron: `T${Math.random().toString(36).slice(2, 35).toUpperCase()}`,
          bsc: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isBackedUp: true,
        isBiometricEnabled: true,
      },
      {
        id: 'wallet-2',
        name: '商务钱包',
        addresses: {
          all: '',
          ethereum: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
          tron: `T${Math.random().toString(36).slice(2, 35).toUpperCase()}`,
          bsc: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isBackedUp: true,
        isBiometricEnabled: false,
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
      addresses: {
        all: '',
        ethereum: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        tron: `T${Math.random().toString(36).slice(2, 35).toUpperCase()}`,
        bsc: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
      },
      createdAt: new Date(),
      isBackedUp: false,
      isBiometricEnabled: hasBiometric,
    };
    
    // Register new wallet in the assets map
    walletAssetsMap[newWallet.id] = [];
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

  const sendTransaction = useCallback(async (to: string, amount: number, symbol: string, memo?: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const txHash = `0x${Math.random().toString(16).slice(2)}`;
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      amount,
      symbol,
      usdValue: amount, // Simplified
      status: 'pending',
      counterparty: to,
      timestamp: new Date(),
      txHash,
      network: 'Ethereum',
      fee: 2.5,
      memo,
    };
    
    setTransactions(prev => [newTx, ...prev]);
    
    // Update balance
    setAssets(prev => prev.map(a => 
      a.symbol === symbol ? { ...a, balance: a.balance - amount, usdValue: a.usdValue - amount } : a
    ));
    
    return txHash;
  }, []);

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
    createWallet,
    switchWallet,
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
