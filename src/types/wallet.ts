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

export interface Wallet {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  isBackedUp: boolean;
  isBiometricEnabled: boolean;
  network: string;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
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

// App-level state
export interface WalletState {
  isAuthenticated: boolean;
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
