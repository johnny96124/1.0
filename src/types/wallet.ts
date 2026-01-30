// Wallet Types - No Web3 terminology exposed to users
import { Notification } from './notification';

export type { Notification, NotificationType, NotificationCategory, NotificationPriority } from './notification';

// ============= TSS Node Types =============

export type TSSNodeStatus = 'not_created' | 'created' | 'recovered';

export interface TSSNodeBackupInfo {
  hasCloudBackup: boolean;
  cloudProvider?: 'icloud' | 'google_drive';
  cloudBackupTime?: Date;
  hasLocalBackup: boolean;
  localBackupTime?: Date;
}

export interface TSSNodeInfo {
  status: TSSNodeStatus;
  createdAt?: Date;
  backup: TSSNodeBackupInfo;
}

// Device session status for kick detection
export type DeviceSessionStatus = 'active' | 'kicked' | 'expired';

export interface DeviceKickInfo {
  kickedAt: Date;
  newDeviceName: string;
  newDeviceLocation?: string;
  reason: 'new_device_login' | 'security_revoke';
}

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
export type ChainId = 'all' | 'ethereum' | 'tron' | 'bsc' | 'solana';

export interface ChainInfo {
  id: ChainId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'all', name: '全部网络', shortName: 'All', icon: 'all', color: 'hsl(var(--accent))' },
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', icon: 'ethereum', color: 'hsl(217 91% 60%)' },
  { id: 'tron', name: 'Tron', shortName: 'TRX', icon: 'tron', color: 'hsl(0 84% 60%)' },
  { id: 'bsc', name: 'BNB Chain', shortName: 'BNB', icon: 'bsc', color: 'hsl(38 92% 50%)' },
  { id: 'solana', name: 'Solana', shortName: 'SOL', icon: 'solana', color: 'hsl(280 80% 60%)' },
];

// Wallet backup channel info
export interface WalletBackupInfo {
  method: 'cloud' | 'file' | 'none';
  cloudProvider?: 'icloud' | 'google_drive';
  lastBackupTime?: Date;
  fileBackupTime?: Date;
}

// Recovery method types
export type RecoveryMethod = 
  | 'scan_device'     // Scan old device (recommended)
  | 'cloud_icloud'    // iCloud recovery
  | 'cloud_google'    // Google Drive recovery
  | 'local_file'      // Local backup file recovery
  | 'private_key';    // Private key import (advanced)

export interface Wallet {
  id: string;
  name: string;
  addresses: Record<ChainId, string>; // Multi-chain addresses
  createdAt: Date;
  isBackedUp: boolean;
  isBiometricEnabled: boolean;
  // MPC escape and backup tracking
  backupInfo?: WalletBackupInfo;
  isEscaped: boolean;
  escapedAt?: Date;
  custodyType: 'mpc' | 'self';
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

// RBF (Replace-By-Fee) record for tracking acceleration/cancellation history
export interface RbfRecord {
  action: 'speedup' | 'cancel';
  oldTxHash: string;
  newTxHash: string;
  oldFee: number;
  newFee: number;
  timestamp: Date;
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
  // Confirmation & block info
  confirmations?: number;           // Number of block confirmations
  blockHeight?: number;             // Block number where tx was included
  // Failure info
  failureReason?: string;           // Reason for failed transactions
  // Risk scanning fields
  riskReasons?: string[];           // KYT risk reasons
  riskScanTime?: Date;              // When the risk scan was performed
  disposalStatus?: 'pending' | 'returned' | 'acknowledged'; // Disposal status for risky inflows
  disposalTxHash?: string;          // TX hash if funds were returned
  disposalTime?: Date;              // When the disposal action was taken
  // RBF (Replace-By-Fee) fields
  isRbfEnabled?: boolean;           // Whether RBF is enabled (for BTC opt-in RBF)
  originalTxHash?: string;          // If this is a replacement tx, the original tx hash
  replacedByTxHash?: string;        // If replaced, the new tx hash
  rbfHistory?: RbfRecord[];         // History of RBF operations
  nonce?: number;                   // EVM transaction nonce
  gasPrice?: number;                // Current gas price in USD
  gasAmount?: number;               // Gas token amount (e.g., ETH amount)
  gasToken?: string;                // Gas token symbol (e.g., 'ETH', 'BNB')
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
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  lastDailyReset: Date;
  lastMonthlyReset: Date;
  requireSatoshiTest: boolean;
  whitelistBypass: boolean;
  highRiskAction: 'block' | 'warn';
}

export interface LimitStatus {
  singleLimit: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
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
  nickname?: string;
}

// ============= Auth Types =============

// User type for routing after login
export type UserType = 'new' | 'returning_with_wallet' | 'returning_without_wallet';

// Auth result returned from login/verify
export interface AuthResult {
  userType: UserType;
  isDeviceAuthorized: boolean;
  hasExistingWallets: boolean;
  hasPassword?: boolean; // Whether user has set a password
}

// ============= PSP (Payment Service Provider) Types =============

// Service types offered by PSP
export type PSPServiceType = 
  | 'collection'  // 收款
  | 'transfer'    // 转账
  | 'withdrawal'  // 出金
  | 'deposit'     // 入金
  | 'settlement'; // 结算

// PSP connection status
export type PSPConnectionStatus = 'active' | 'suspended' | 'pending' | 'expired' | 'rejected';

// PSP Provider information
export interface PSPProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  officialUrl?: string;
  isVerified: boolean; // 官方认证
  rating?: number; // 评分 1-5
  walletAddress?: string; // PSP's primary receiving address
  
  // Contact info
  contact: {
    email?: string;
    phone?: string;
    supportUrl?: string;
  };
  
  // Fee configuration
  feeConfig: {
    collection: number; // 收款费率 %
    withdrawal: number; // 提现费率 %
    transfer: number; // 转账费率 %
    minWithdrawal?: number; // 最低提现金额
  };
  
  // Available services
  availableServices: PSPServiceType[];
}

// User's connection to a PSP
export interface PSPConnection {
  id: string;
  pspId: string;
  psp: PSPProvider;
  
  // Connection status
  status: PSPConnectionStatus;
  connectedAt: Date;
  expiresAt?: Date;
  
  // Rejection info (when status is 'rejected')
  rejectionInfo?: {
    reason: string;
    rejectedAt: Date;
    canReapply: boolean;
    reapplyAfter?: Date;
  };
  
  // Authorized permissions
  permissions: {
    readBalance: boolean;
    readTransactions: boolean;
    collection: boolean;
    transfer: boolean;
    withdrawal: boolean;
  };
  
  // Limit settings
  limits?: {
    dailyTransfer: number;
    singleTransfer: number;
    dailyWithdrawal: number;
  };
  
  // Statistics
  stats: {
    totalTransactions: number;
    totalVolume: number;
    lastTransactionAt?: Date;
  };
  
  // PSP wallet addresses (for transfer interception)
  addresses?: {
    network: string;
    address: string;
  }[];
}

// PSP announcement
export interface PSPAnnouncement {
  id: string;
  pspId: string;
  type: 'update' | 'maintenance' | 'promotion' | 'alert';
  title: string;
  content: string;
  publishedAt: Date;
  isRead: boolean;
}

// PSP authorization request (for connecting)
export interface PSPAuthRequest {
  code: string; // Authorization code
  pspInfo: PSPProvider;
  requestedPermissions: string[];
  expiresAt: Date;
}

// ============= Account Risk Management Types =============

export type AccountRiskStatus = 'healthy' | 'warning' | 'restricted';

export interface AccountRiskSummary {
  status: AccountRiskStatus;
  pendingRiskCount: number;       // Total pending risky transactions
  yellowCount: number;            // Suspicious (pending only)
  redCount: number;               // High risk (pending only)
  totalRiskExposure: number;      // Total USD value of risky funds
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
