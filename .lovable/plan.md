

# RBF (Replace-By-Fee) 交易加速与取消功能设计

## 一、RBF 技术背景

### 1.1 什么是 RBF？
RBF (Replace-By-Fee) 是一种允许用户在交易未被确认前，通过提高手续费来替换原交易的机制。主要用于：
- **加速交易**：保持原交易内容不变，仅提高 Gas 费用
- **取消交易**：发送一笔相同 nonce 但金额为 0 且收款方为自己的替换交易

### 1.2 各链 RBF 支持情况

| 链类型 | RBF 支持 | 机制说明 | 取消支持 |
|--------|----------|----------|----------|
| **EVM (Ethereum/BSC)** | 支持 | 使用相同 nonce 发送新交易，Gas Price 需提高至少 10% | 支持（发送 0 金额到自己地址） |
| **Bitcoin** | 支持 (Opt-in) | BIP-125 标准，sequence number < 0xFFFFFFFE 时可替换 | 支持（CPFP 或直接替换） |
| **Tron** | 不支持 | Tron 使用 Bandwidth/Energy 模型，交易一旦广播无法替换 | 不支持 |

### 1.3 技术实现要点

**EVM 链 (Ethereum/BSC)**：
```text
替换交易需满足：
1. 相同的 nonce
2. maxFeePerGas 或 gasPrice 至少提高 10%
3. 相同发送地址签名
```

**Bitcoin**：
```text
替换交易需满足：
1. 原交易 sequence number < 0xFFFFFFFE (Opt-in RBF)
2. 新交易手续费 > 原交易手续费
3. 使用相同 UTXO 输入
```

---

## 二、产品需求设计

### 2.1 功能入口

在交易详情 Drawer 中，当交易满足以下条件时显示 RBF 操作入口：
- 交易状态为 `pending`
- 交易类型为 `send`（发送方才能替换）
- 链类型支持 RBF（Ethereum、BSC 支持；Tron 不显示）

### 2.2 用户流程

```text
┌─────────────────────────────────────────────────────────────┐
│                    交易详情 Drawer                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Token Icon + 状态徽章]                               │  │
│  │  -100 USDT                                            │  │
│  │  ≈ $100.00                                            │  │
│  │  [处理中] 标签                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  收款方: 0x1234...5678                                      │
│  网络: Ethereum                                             │
│  时间: 2026-01-29 10:30:00                                  │
│  网络费用: $2.50                                            │
│  交易哈希: 0xabcd...efgh                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ⚡ 交易加速                                           │  │
│  │  交易已等待超过预期时间？尝试提高网络费用加速确认        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [🚀 加速交易]  [✕ 取消交易]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐      ┌─────────────────────────┐
│   加速确认页面   │      │      取消确认页面        │
└─────────────────┘      └─────────────────────────┘
```

### 2.3 加速交易流程

**Step 1: 点击"加速交易"按钮**
→ 打开加速费用选择 Drawer

**Step 2: 选择新的网络费用**
显示三档加速选项（基于当前网络状况）：
- 慢速加速 (+20%): $3.00 → 预计 20 分钟
- 标准加速 (+50%): $3.75 → 预计 5 分钟  
- 快速加速 (+100%): $5.00 → 预计 1 分钟

**Step 3: 确认加速**
显示费用差额和风险提示：
```text
┌─────────────────────────────────────────┐
│  确认加速交易                            │
│                                         │
│  原网络费用:    $2.50                    │
│  新网络费用:    $3.75                    │
│  额外支付:      $1.25                    │
│                                         │
│  ⚠️ 加速交易将替换原交易，原交易将被丢弃  │
│                                         │
│  [确认加速]                              │
└─────────────────────────────────────────┘
```

**Step 4: 生物识别/密码验证**
→ 调用系统验证

**Step 5: 成功反馈**
→ 显示新交易哈希，原交易记录更新状态

### 2.4 取消交易流程

**Step 1: 点击"取消交易"按钮**
→ 打开取消确认 Drawer

**Step 2: 显示取消费用**
取消交易也需要支付 Gas 费用：
```text
┌─────────────────────────────────────────┐
│  ⚠️ 取消交易                             │
│                                         │
│  取消将发送一笔替换交易使原交易失效        │
│                                         │
│  取消费用:      $3.00                    │
│  (需略高于原交易费用才能成功替换)          │
│                                         │
│  原资金将返回您的钱包                      │
│                                         │
│  [确认取消]                              │
└─────────────────────────────────────────┘
```

**Step 3: 生物识别/密码验证**
**Step 4: 成功反馈**

### 2.5 Tron 链特殊处理

当用户查看 Tron 链上的 pending 交易时：
- 不显示"加速交易"和"取消交易"按钮
- 显示提示信息：「Tron 网络不支持交易加速，请耐心等待交易确认」

---

## 三、数据模型扩展

### 3.1 Transaction 类型扩展

```typescript
interface Transaction {
  // ... 现有字段
  
  // RBF 相关字段
  isRbfEnabled?: boolean;        // 是否支持 RBF (BTC opt-in)
  originalTxHash?: string;       // 如果是 RBF 替换交易，记录原交易哈希
  replacedByTxHash?: string;     // 被替换后的新交易哈希
  rbfHistory?: RbfRecord[];      // RBF 操作历史
  nonce?: number;                // EVM 交易 nonce
}

interface RbfRecord {
  action: 'speedup' | 'cancel';
  oldTxHash: string;
  newTxHash: string;
  oldFee: number;
  newFee: number;
  timestamp: Date;
}
```

### 3.2 交易状态更新逻辑

当 RBF 交易成功广播后：
1. 原交易状态保持 `pending`，添加 `replacedByTxHash` 字段
2. 新交易创建，状态为 `pending`，添加 `originalTxHash` 字段
3. 当新交易确认后，原交易状态更新为 `failed`（被替换）或从列表移除

---

## 四、UI 组件设计

### 4.1 新增组件

| 组件 | 说明 |
|------|------|
| `RbfActionSection` | 在交易详情 Drawer 中显示的 RBF 操作区域 |
| `SpeedUpDrawer` | 加速交易选项和确认 Drawer |
| `CancelTxDrawer` | 取消交易确认 Drawer |
| `RbfSuccessView` | RBF 操作成功后的反馈页面 |

### 4.2 RbfActionSection 组件

```text
┌─────────────────────────────────────────────────────────────┐
│  💡 交易等待确认中                                           │
│  已等待 15 分钟，网络拥堵可能导致确认延迟                      │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │  🚀 加速交易         │  │  ✕ 取消交易          │          │
│  │  提高费用加快确认     │  │  放弃本次转账        │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 SpeedUpDrawer 设计

复用现有 `NetworkFeeSelector` 的视觉风格，但显示加速选项：

```text
┌─────────────────────────────────────────────┐
│  加速交易                              [X]  │
│  Ethereum 网络                              │
├─────────────────────────────────────────────┤
│                                             │
│  当前费用: $2.50 (0.00072 ETH)              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🐢 +20% 加速                         │   │
│  │     ~20 分钟        0.00086 ETH     │   │
│  │                     ≈ $3.00         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⏱️ +50% 加速                    [✓]  │   │
│  │     ~5 分钟         0.00108 ETH     │   │
│  │                     ≈ $3.75         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ⚡ +100% 加速                        │   │
│  │     ~1 分钟         0.00144 ETH     │   │
│  │                     ≈ $5.00         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  额外支付: +$1.25                            │
│                                             │
│  [        确认加速        ]                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 五、页面修改清单

### 5.1 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `src/types/wallet.ts` | 扩展 Transaction 类型，添加 RBF 相关字段 |
| `src/pages/Home.tsx` | 在交易详情 Drawer 中添加 RBF 操作区域 |
| `src/pages/History.tsx` | 在交易详情 Drawer 中添加 RBF 操作区域 |
| `src/pages/AssetDetail.tsx` | 在交易详情 Drawer 中添加 RBF 操作区域 |
| `src/pages/RiskManagement.tsx` | 在交易详情 Drawer 中添加 RBF 操作区域 |

### 5.2 需要新建的文件

| 文件 | 说明 |
|------|------|
| `src/components/RbfActionSection.tsx` | RBF 操作入口组件 |
| `src/components/SpeedUpDrawer.tsx` | 加速交易 Drawer |
| `src/components/CancelTxDrawer.tsx` | 取消交易 Drawer |
| `src/lib/rbf-utils.ts` | RBF 相关工具函数（判断是否支持、计算费用等） |

---

## 六、边界情况处理

### 6.1 RBF 失败场景

| 场景 | 处理方式 |
|------|----------|
| 原交易已被确认 | 显示提示「交易已确认，无法加速/取消」|
| 余额不足支付新费用 | 禁用操作按钮，显示「余额不足」|
| 网络错误 | 显示错误 Toast，允许重试 |
| 替换交易被拒绝 | 显示「网络拒绝替换交易，请稍后重试」|

### 6.2 交易状态同步

```text
场景：用户发起 RBF 后离开页面

处理：
1. RBF 交易广播成功后，本地立即更新状态
2. 定时轮询检查交易确认状态
3. 新交易确认后，更新原交易为「已替换」状态
```

### 6.3 Bitcoin 特殊处理

Bitcoin 需要检查原交易是否启用了 Opt-in RBF：
- 如果 `isRbfEnabled = false`，显示「此交易未启用 RBF，无法加速」
- 未来发送交易时，默认启用 RBF (sequence < 0xFFFFFFFE)

---

## 七、实现优先级

### Phase 1 (MVP)
1. 扩展 Transaction 类型
2. 创建 RbfActionSection 组件
3. 创建 SpeedUpDrawer 组件
4. 在 History 页面集成 RBF 功能

### Phase 2
1. 创建 CancelTxDrawer 组件
2. 在 Home、AssetDetail、RiskManagement 页面集成
3. 添加交易状态同步逻辑

### Phase 3
1. Bitcoin RBF 支持
2. 添加 RBF 历史记录展示
3. 交易确认推送通知

---

## 八、技术实现细节

### 8.1 判断是否支持 RBF

```typescript
// src/lib/rbf-utils.ts

export function canSpeedUp(tx: Transaction): boolean {
  // 只有发送方的 pending 交易才能加速
  if (tx.status !== 'pending' || tx.type !== 'send') return false;
  
  // Tron 不支持 RBF
  if (tx.network === 'tron') return false;
  
  // 已被替换的交易不能再次加速
  if (tx.replacedByTxHash) return false;
  
  // Bitcoin 需要检查 opt-in RBF
  if (tx.network === 'bitcoin' && !tx.isRbfEnabled) return false;
  
  return true;
}

export function canCancel(tx: Transaction): boolean {
  // 与加速条件相同
  return canSpeedUp(tx);
}
```

### 8.2 计算加速费用

```typescript
export function calculateSpeedUpFees(
  currentFee: number,
  networkId: ChainId
): SpeedUpOption[] {
  const multipliers = [1.2, 1.5, 2.0]; // +20%, +50%, +100%
  
  return multipliers.map((mult, index) => ({
    tier: ['slow', 'standard', 'fast'][index] as FeeTier,
    label: [`+20% 加速`, `+50% 加速`, `+100% 加速`][index],
    newFee: currentFee * mult,
    additionalFee: currentFee * (mult - 1),
    estimatedTime: ['~20分钟', '~5分钟', '~1分钟'][index],
  }));
}
```

