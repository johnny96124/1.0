import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Wallet, Asset, Transaction, Contact, Device, 
  SecurityConfig, BackupStatus, WalletStatus, WalletState,
  RiskColor, ChainId, AggregatedAsset, UserInfo
} from '@/types/wallet';

// Mock data for demonstration - multi-chain assets
// Icons now use symbol for dynamic CDN lookup
const mockAssets: Asset[] = [
  // Ethereum chain
  { symbol: 'USDT', name: 'Tether USD', balance: 8500.50, usdValue: 8500.50, change24h: 0.01, icon: 'USDT', network: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', balance: 3230.00, usdValue: 3230.00, change24h: 0.00, icon: 'USDC', network: 'ethereum' },
  { symbol: 'ETH', name: 'Ethereum', balance: 2.45, usdValue: 8575.00, change24h: 2.34, icon: 'ETH', network: 'ethereum' },
  // Tron chain
  { symbol: 'USDT', name: 'Tether USD', balance: 2500.00, usdValue: 2500.00, change24h: 0.01, icon: 'USDT', network: 'tron' },
  { symbol: 'TRX', name: 'Tron', balance: 5000, usdValue: 550.00, change24h: -1.2, icon: 'TRX', network: 'tron' },
  // BSC chain
  { symbol: 'USDT', name: 'Tether USD', balance: 1580.00, usdValue: 1580.00, change24h: 0.01, icon: 'USDT', network: 'bsc' },
  { symbol: 'BNB', name: 'BNB', balance: 3.5, usdValue: 2100.00, change24h: 1.5, icon: 'BNB', network: 'bsc' },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    amount: 2500,
    symbol: 'USDT',
    usdValue: 2500,
    status: 'confirmed',
    counterparty: '0x1234...5678',
    counterpartyLabel: 'ABC Trading Co.',
    timestamp: new Date(Date.now() - 3600000),
    txHash: '0xabc...def',
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
    counterparty: 'T9yD14...xK3m',
    counterpartyLabel: 'Supplier XYZ',
    timestamp: new Date(Date.now() - 86400000),
    txHash: 'abc123...def',
    network: 'tron',
    fee: 2.5,
    riskScore: 'green',
  },
  {
    id: '3',
    type: 'receive',
    amount: 5000,
    symbol: 'USDC',
    usdValue: 5000,
    status: 'pending',
    counterparty: '0x9999...1111',
    timestamp: new Date(Date.now() - 1800000),
    txHash: '0x111...222',
    network: 'ethereum',
    riskScore: 'yellow',
  },
  {
    id: '4',
    type: 'send',
    amount: 1.5,
    symbol: 'BNB',
    usdValue: 900,
    status: 'confirmed',
    counterparty: '0xBnb...addr',
    timestamp: new Date(Date.now() - 172800000),
    txHash: '0xbnb...hash',
    network: 'bsc',
    fee: 0.001,
    riskScore: 'green',
  },
];

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
    location: 'Shanghai, CN',
    isCurrent: true,
    status: 'active',
  },
];

const defaultSecurityConfig: SecurityConfig = {
  singleTransactionLimit: 10000,
  dailyLimit: 50000,
  requireSatoshiTest: true,
  whitelistBypass: false,
  highRiskAction: 'block',
};

const defaultBackupStatus: BackupStatus = {
  cloudBackup: false,
  fileBackup: false,
};

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
  
  // Contact actions
  addContact: (contact: Omit<Contact, 'id'>) => void;
  removeContact: (id: string) => void;
  
  // Device actions
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  
  // Security config
  updateSecurityConfig: (config: Partial<SecurityConfig>) => void;
  
  // Onboarding state
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
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
    
    // Simulate existing user with wallet - login goes directly to home
    const defaultWallet: Wallet = {
      id: `wallet-default`,
      name: '我的钱包',
      addresses: {
        all: '',
        ethereum: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        tron: `T${Math.random().toString(36).slice(2, 35).toUpperCase()}`,
        bsc: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Created 7 days ago
      isBackedUp: true,
      isBiometricEnabled: true,
    };
    
    setWallets([defaultWallet]);
    setCurrentWallet(defaultWallet);
    setAssets(mockAssets);
    setTransactions(mockTransactions);
    setContacts(mockContacts);
    setDevices(mockDevices);
    setWalletStatus('fully_secure');
    setHasPin(true);
    setHasBiometric(true);
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
    
    setWallets(prev => [...prev, newWallet]);
    setCurrentWallet(newWallet);
    setAssets(mockAssets);
    setTransactions(mockTransactions);
    setContacts(mockContacts);
    setDevices(mockDevices);
    setWalletStatus('created_no_backup');
    
    return newWallet;
  }, [hasBiometric]);

  const switchWallet = useCallback((walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setCurrentWallet(wallet);
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

  const value: WalletContextType = {
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
    addContact,
    removeContact,
    addDevice,
    removeDevice,
    updateSecurityConfig,
    onboardingStep,
    setOnboardingStep,
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
