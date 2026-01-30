

## 链名称定义全局审计与统一方案

### 需求明确

用户希望统一支持以下4条链：
- **Ethereum** (主链代币: ETH)
- **Tron** (主链代币: TRX)
- **Solana** (主链代币: SOL)
- **BNB Chain** (主链代币: BNB)

---

### 当前问题分析

#### 1. 核心定义缺少 Solana

**文件:** `src/types/wallet.ts` (第46-61行)

当前 `ChainId` 类型和 `SUPPORTED_CHAINS` 数组只支持3条链，缺少 Solana：

```typescript
// 当前定义
export type ChainId = 'all' | 'ethereum' | 'tron' | 'bsc';  // 缺少 'solana'

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'all', name: '全部网络', shortName: 'All', icon: 'all', color: '...' },
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', icon: 'ethereum', color: '...' },
  { id: 'tron', name: 'Tron', shortName: 'TRX', icon: 'tron', color: '...' },
  { id: 'bsc', name: 'BNB Chain', shortName: 'BNB', icon: 'bsc', color: '...' },
  // 缺少 Solana
];
```

---

#### 2. 地址验证逻辑缺少 Solana

**涉及文件:**
- `src/components/ContactDetailDrawer.tsx` (第94-103行)
- `src/pages/ContactForm.tsx`
- `src/pages/Send.tsx` (第175-181行)

当前只验证 EVM 和 Tron 地址格式：

```typescript
// 当前验证逻辑
const validateAddress = (addr: string, chain: ChainId): boolean => {
  if (chain === 'ethereum' || chain === 'bsc') {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);  // EVM
  }
  if (chain === 'tron') {
    return /^T[a-zA-Z0-9]{33}$/.test(addr);    // Tron
  }
  return false;  // Solana 会返回 false
};
```

Solana 地址格式需要添加：Base58 编码，32-44 字符长度

---

#### 3. Mock 地址数据缺少 Solana

**文件:** `src/pages/Receive.tsx` (第30-34行)

```typescript
const MOCK_ADDRESSES: Record<Exclude<ChainId, 'all'>, string> = {
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
  tron: 'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
  bsc: '0x8B4c5A9d3E7f1C2b0A6D8E9F4C3B2A1E7D6C5B4A',
  // 缺少 solana
};
```

---

#### 4. 图标映射缺少完整配置

**文件:** `src/lib/crypto-icons.ts` (第35-49行)

当前 `CHAIN_ICON_MAP` 已有 `solana: 'sol'` 映射，但需要确保图标可用。

---

#### 5. Mock 资产数据不一致

**文件:** `src/contexts/WalletContext.tsx` (第13-64行)

SOL 代币被错误地归类到 `ethereum` 网络：

```typescript
// 错误: SOL 应该在 solana 网络，而非 ethereum
{ symbol: 'SOL', name: 'Solana', balance: 12.5, usdValue: 2312.50, change24h: 3.2, icon: 'SOL', network: 'ethereum' },
```

---

#### 6. Token 配置中 networks 数组错误

**文件:** `src/lib/tokens.ts` (第24行)

```typescript
// 错误: SOL 的 networks 应该是 ['solana']，不是 ['ethereum']
{ symbol: 'SOL', name: 'Solana', networks: ['ethereum'], price: 185.00, change24h: 3.2, category: 'layer1' },
```

---

#### 7. RBF 工具缺少 Solana 处理

**文件:** `src/lib/rbf-utils.ts` (第11-14行)

需要将 Solana 添加到不支持 RBF 的链列表：

```typescript
const RBF_SUPPORTED_CHAINS = ['ethereum', 'bsc'];
const RBF_UNSUPPORTED_CHAINS = ['tron'];  // 需要添加 'solana'
```

并在 `getGasToken` 函数中添加 Solana case：

```typescript
case 'solana':
  return 'SOL';
```

---

#### 8. chainLabel/getChainLabel 不一致

多个文件中有重复的链名称获取逻辑：

| 文件 | 函数名 | 返回值 |
|------|--------|--------|
| `ContactCard.tsx` | `getChainLabel` | EVM / TRX / BSC |
| `ContactDetail.tsx` | `getChainName` | Ethereum / Tron / BNB Chain |
| `Send.tsx` | `getChainLabel` | EVM / TRX / 默认大写 |
| `TokenSelector.tsx` | `getChainName` | shortName from SUPPORTED_CHAINS |

建议统一为一个工具函数。

---

### 修改计划

#### 步骤 1: 更新核心类型定义

**文件:** `src/types/wallet.ts`

```typescript
// 添加 solana 到 ChainId
export type ChainId = 'all' | 'ethereum' | 'tron' | 'bsc' | 'solana';

// 添加 Solana 到 SUPPORTED_CHAINS
export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'all', name: '全部网络', shortName: 'All', icon: 'all', color: 'hsl(var(--accent))' },
  { id: 'ethereum', name: 'Ethereum', shortName: 'ETH', icon: 'ethereum', color: 'hsl(217 91% 60%)' },
  { id: 'tron', name: 'Tron', shortName: 'TRX', icon: 'tron', color: 'hsl(0 84% 60%)' },
  { id: 'bsc', name: 'BNB Chain', shortName: 'BNB', icon: 'bsc', color: 'hsl(38 92% 50%)' },
  { id: 'solana', name: 'Solana', shortName: 'SOL', icon: 'solana', color: 'hsl(280 80% 60%)' },
];
```

#### 步骤 2: 创建统一的链工具函数

**新建文件:** `src/lib/chain-utils.ts`

```typescript
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';

// 获取链全称
export function getChainName(chainId: ChainId): string {
  return SUPPORTED_CHAINS.find(c => c.id === chainId)?.name || chainId;
}

// 获取链简称
export function getChainShortName(chainId: ChainId): string {
  return SUPPORTED_CHAINS.find(c => c.id === chainId)?.shortName || chainId;
}

// 获取链标签（用于地址簿等场景）
export function getChainLabel(chainId: ChainId): string {
  if (chainId === 'ethereum' || chainId === 'bsc') return 'EVM';
  if (chainId === 'tron') return 'TRX';
  if (chainId === 'solana') return 'SOL';
  return chainId.toUpperCase();
}

// 验证地址格式
export function validateAddress(address: string, chainId: ChainId): boolean {
  if (!address) return false;
  
  if (chainId === 'ethereum' || chainId === 'bsc') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  if (chainId === 'tron') {
    return /^T[a-zA-Z0-9]{33}$/.test(address);
  }
  if (chainId === 'solana') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  return false;
}

// 获取地址占位符
export function getAddressPlaceholder(chainId: ChainId): string {
  if (chainId === 'tron') return 'T...';
  if (chainId === 'solana') return '1-9A-HJ...';
  return '0x...';
}

// 获取 Gas Token
export function getGasToken(chainId: ChainId): string {
  switch (chainId) {
    case 'ethereum': return 'ETH';
    case 'bsc': return 'BNB';
    case 'tron': return 'TRX';
    case 'solana': return 'SOL';
    default: return chainId.toUpperCase();
  }
}
```

#### 步骤 3: 更新 Mock 数据

**文件:** `src/pages/Receive.tsx`

```typescript
const MOCK_ADDRESSES: Record<Exclude<ChainId, 'all'>, string> = {
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
  tron: 'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
  bsc: '0x8B4c5A9d3E7f1C2b0A6D8E9F4C3B2A1E7D6C5B4A',
  solana: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
};
```

**文件:** `src/contexts/WalletContext.tsx`

修正 SOL 资产归属并添加 Solana 原生资产：

```typescript
// 将 SOL 从 ethereum 移到 solana 网络
{ symbol: 'SOL', name: 'Solana', balance: 12.5, usdValue: 2312.50, change24h: 3.2, icon: 'SOL', network: 'solana' },
// 添加 Solana 链的 USDT/USDC
{ symbol: 'USDT', name: 'Tether USD', balance: 1000.00, usdValue: 1000.00, change24h: 0.01, icon: 'USDT', network: 'solana' },
```

#### 步骤 4: 更新 tokens.ts

**文件:** `src/lib/tokens.ts`

修正 SOL 和其他代币的 networks：

```typescript
{ symbol: 'SOL', name: 'Solana', networks: ['solana'], price: 185.00, change24h: 3.2, category: 'layer1' },
{ symbol: 'USDT', name: 'Tether USD', networks: ['ethereum', 'tron', 'bsc', 'solana'], ... },
{ symbol: 'USDC', name: 'USD Coin', networks: ['ethereum', 'bsc', 'solana'], ... },
```

#### 步骤 5: 更新 RBF 工具

**文件:** `src/lib/rbf-utils.ts`

```typescript
const RBF_UNSUPPORTED_CHAINS = ['tron', 'solana'];

export function getGasToken(network: string): string {
  switch (network) {
    case 'ethereum': return 'ETH';
    case 'bsc': return 'BNB';
    case 'tron': return 'TRX';
    case 'solana': return 'SOL';
    default: return 'ETH';
  }
}
```

#### 步骤 6: 重构组件使用统一工具函数

需更新以下组件以使用 `chain-utils.ts`：
- `src/components/ContactCard.tsx` - 删除本地 `getChainLabel`
- `src/components/ContactDetailDrawer.tsx` - 使用统一验证和占位符
- `src/pages/ContactDetail.tsx` - 删除本地 `getChainName`
- `src/pages/ContactForm.tsx` - 使用统一验证
- `src/pages/Send.tsx` - 删除本地 `getChainLabel` 和 `getChainName`
- `src/components/TokenSelector.tsx` - 删除本地 `getChainName`
- `src/components/AssetPickerDrawer.tsx` - 删除本地 `getChainName`
- `src/pages/Home.tsx` - 删除本地 `getChainName`

---

### 修改文件清单

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/types/wallet.ts` | 修改 | 添加 `solana` 到 ChainId 和 SUPPORTED_CHAINS |
| `src/lib/chain-utils.ts` | 新建 | 统一的链工具函数 |
| `src/lib/tokens.ts` | 修改 | 修正 SOL 的 networks 配置 |
| `src/lib/rbf-utils.ts` | 修改 | 添加 Solana 支持 |
| `src/lib/crypto-icons.ts` | 检查 | 确认 solana 图标映射正确 |
| `src/contexts/WalletContext.tsx` | 修改 | 修正 Mock 资产数据 |
| `src/pages/Receive.tsx` | 修改 | 添加 Solana 地址 |
| `src/components/ContactCard.tsx` | 修改 | 使用统一工具函数 |
| `src/components/ContactDetailDrawer.tsx` | 修改 | 使用统一工具函数和验证 |
| `src/pages/ContactForm.tsx` | 修改 | 使用统一工具函数和验证 |
| `src/pages/ContactDetail.tsx` | 修改 | 使用统一工具函数 |
| `src/pages/Send.tsx` | 修改 | 使用统一工具函数 |
| `src/components/TokenSelector.tsx` | 修改 | 使用统一工具函数 |
| `src/components/AssetPickerDrawer.tsx` | 修改 | 使用统一工具函数 |
| `src/pages/Home.tsx` | 修改 | 使用统一工具函数 |

