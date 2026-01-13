// Wallet Types - No Web3 terminology exposed to users

export type WalletStatus = 
  | 'not_created'      // S0: No wallet exists
  | 'created_no_backup' // S1: Created but backup incomplete
  | 'backup_complete'   // S2: Backup done, may need biometric
  | 'fully_secure'      // S3: All security measures complete
  | 'device_risk'       // S4: Root/jailbreak detected
  | 'service_unavailable'; // S5: Cobo service down

export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskColor = 'green' | 'yellow' | 'red';

// Supported chains
export type ChainId = 'all' | 'ethereum' | 'tron' | 'bsc';

export interface ChainInfo {
  id: ChainId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'all', name: '全部网络', shortName: 'All', icon: '🌐', color: 'hsl(var(--accent))' },
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', icon: '⟠', color: 'hsl(217 91% 60%)' },
  { id: 'tron', name: 'Tron', shortName: 'TRX', icon: '💎', color: 'hsl(0 84% 60%)' },
  { id: 'bsc', name: 'BNB Chain', shortName: 'BNB', icon: '🔶', color: 'hsl(38 92% 50%)' },
];

export interface Wallet {
  id: string;
  name: string;
  addresses: Record<ChainId, string>; // Multi-chain addresses
  createdAt: Date;
  isBackedUp: boolean;
  isBiometricEnabled: boolean;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  network: ChainId; // Which chain this asset is on
}

// Aggregated asset for display when viewing "All" chains
export interface AggregatedAsset {
  symbol: string;
  name: string;
  totalBalance: number;
  totalUsdValue: number;
  change24h: number;
  icon: string;
  chains: { network: ChainId; balance: number; usdValue: number }[];
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  symbol: string;
  usdValue: number;
  status: 'pending' | 'confirmed' | 'failed';
  counterparty: string;
  counterpartyLabel?: string;
  timestamp: Date;
  txHash: string;
  network: string;
  fee?: number;
  riskScore?: RiskColor;
  memo?: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  network: string;
  tags: string[];
  isOfficial: boolean;
  isWhitelisted: boolean;
  lastUsed?: Date;
  notes?: string;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  lastActive: Date;
  location?: string;
  isCurrent: boolean;
  status: 'active' | 'pending' | 'revoked';
}

export interface SecurityConfig {
  singleTransactionLimit: number;
  dailyLimit: number;
  requireSatoshiTest: boolean;
  whitelistBypass: boolean;
  highRiskAction: 'block' | 'warn';
}

export interface AddressRiskScan {
  address: string;
  score: RiskColor;
  riskLevel: number; // 0-100
  reasons: string[];
  isSanctioned: boolean;
  lastUpdated: Date;
}

export interface BackupStatus {
  cloudBackup: boolean;
  cloudProvider?: 'icloud' | 'google_drive';
  lastBackupDate?: Date;
  fileBackup: boolean;
}

// User info
export interface UserInfo {
  email: string;
  avatar?: string;
}

// App-level state
export interface WalletState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  currentWallet: Wallet | null;
  wallets: Wallet[];
  assets: Asset[];
  transactions: Transaction[];
  contacts: Contact[];
  devices: Device[];
  securityConfig: SecurityConfig;
  backupStatus: BackupStatus;
  walletStatus: WalletStatus;
  hasPin: boolean;
  hasBiometric: boolean;
}
