
# 转账流程优化实施计划

## 项目概述

将现有转账流程从 **地址 → 金额 → 确认** 优化为 **币种选择 → 地址输入 → 金额输入 → 确认** 的新流程，提升用户体验和操作效率。

---

## 新流程设计

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           新转账流程                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Step 1: 选择币种      Step 2: 输入地址      Step 3: 输入金额           │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│   │  搜索框       │     │  地址输入框   │     │  金额显示     │           │
│   │  链筛选器     │ ──► │  扫码按钮     │ ──► │  数字键盘     │           │
│   │  币种列表     │     │  联系人按钮   │     │  可用余额     │           │
│   │  (按余额排序) │     │  风险评估     │     │  MAX按钮     │            │
│   └──────────────┘     └──────────────┘     └──────────────┘            │
│                                                      │                   │
│                                                      ▼                   │
│                        Step 4: 确认转账      Step 5: 验证 & 成功         │
│                        ┌──────────────┐     ┌──────────────┐            │
│                        │  交易摘要     │     │  生物识别     │           │
│                        │  网络费用     │ ──► │  转账成功     │           │
│                        │  备注输入     │     │  查看记录     │           │
│                        │  风险确认     │     └──────────────┘            │
│                        └──────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 实施任务分解

### 任务 1: 创建增强版币种选择器组件 (AssetPickerDrawer)

**创建新文件**: `src/components/AssetPickerDrawer.tsx`

**功能特性**:
- 全屏抽屉式选择器
- 顶部搜索栏（支持币种名称/符号搜索）
- 链筛选器（复用现有 `ChainSelector` 样式）
- 币种列表默认按 USD 余额降序排序
- 每个币种卡片显示: 图标、符号、链标识、余额、USD 价值
- 空状态和搜索无结果状态处理

**组件接口**:
```typescript
interface AssetPickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  selectedAsset?: Asset;
}
```

**UI 布局**:
```text
┌──────────────────────────────────┐
│  ← 选择币种                       │ Header
├──────────────────────────────────┤
│  🔍 搜索币种...                   │ 搜索框
├──────────────────────────────────┤
│  [All] [ETH] [TRX] [BNB]         │ 链筛选器
├──────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ 🪙 USDT     ETH    $8,500  │ │
│  │    Tether   8,500 USDT      │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ ⚡ ETH      ETH    $8,575  │ │
│  │    Ethereum 2.45 ETH        │ │
│  └─────────────────────────────┘ │
│          ... 更多币种 ...         │
└──────────────────────────────────┘
```

---

### 任务 2: 重构 Send.tsx 步骤顺序

**修改文件**: `src/pages/Send.tsx`

**变更内容**:

1. **步骤状态更新**:
   ```typescript
   // 旧流程
   type Step = 'address' | 'amount' | 'confirm' | 'auth' | 'success';
   
   // 新流程
   type Step = 'asset' | 'address' | 'amount' | 'confirm' | 'auth' | 'success';
   ```

2. **初始步骤变更**:
   - 默认从 `asset` 步骤开始
   - 如果通过 URL 参数指定了币种（如 `/send?asset=USDC`），则跳过币种选择
   - 如果来自 PSP 页面并带有预填地址，保持现有逻辑

3. **Header 标题映射更新**:
   ```typescript
   const getStepTitle = () => {
     switch (step) {
       case 'asset': return '选择币种';
       case 'address': return '收款地址';
       case 'amount': return '输入金额';
       case 'confirm': return '确认转账';
       case 'auth': return '验证身份';
       case 'success': return '转账成功';
     }
   };
   ```

4. **返回逻辑更新**:
   ```typescript
   // 返回按钮逻辑
   if (step === 'asset') navigate(-1);
   else if (step === 'address') setStep('asset');
   else if (step === 'amount') setStep('address');
   // ... 其余保持不变
   ```

---

### 任务 3: 实现币种选择步骤 UI

**位置**: `Send.tsx` 内新增 `step === 'asset'` 分支

**功能**:
- 显示搜索框（实时过滤）
- 显示链筛选器（水平滚动）
- 显示按余额排序的币种列表
- 点击币种后自动进入地址步骤

**过滤与排序逻辑**:
```typescript
const filteredAndSortedAssets = useMemo(() => {
  let result = assets;
  
  // 链筛选
  if (selectedChain !== 'all') {
    result = result.filter(a => a.network === selectedChain);
  }
  
  // 搜索过滤
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(a => 
      a.symbol.toLowerCase().includes(query) ||
      a.name.toLowerCase().includes(query)
    );
  }
  
  // 按 USD 价值降序排序
  return result.sort((a, b) => b.usdValue - a.usdValue);
}, [assets, selectedChain, searchQuery]);
```

---

### 任务 4: 优化地址输入步骤

**修改文件**: `src/pages/Send.tsx`

**优化内容**:

1. **显示已选币种信息**:
   - 在地址输入区域上方显示当前选择的币种和余额
   - 可点击切换回币种选择步骤

2. **地址输入区域**:
   - 保持现有输入框、扫码、联系人按钮
   - 保持风险评估功能

3. **联系人筛选**:
   - 联系人列表可按当前选择的链进行预筛选
   - 传递 `selectedNetwork={selectedAsset.network}` 给 `ContactDrawer`

---

### 任务 5: 优化确认页面

**修改文件**: `src/pages/Send.tsx` 的 `step === 'confirm'` 部分

**优化内容**:

1. **信息布局优化**:
   ```text
   ┌────────────────────────────────┐
   │      🪙 1,000 USDT            │  金额卡片
   │       ≈ $1,000.00             │
   ├────────────────────────────────┤
   │  收款方                         │
   │  张三                          │
   │  0x1234...abcd                │
   ├────────────────────────────────┤
   │  网络          Ethereum ⚡     │
   │  网络费用      ~$2.50 (标准)   │
   │  预计到账      约 5 分钟        │
   ├────────────────────────────────┤
   │  备注 (可选)                   │
   │  ┌─────────────────────────┐  │
   │  │ 添加对账信息...          │  │
   │  └─────────────────────────┘  │
   └────────────────────────────────┘
   ```

2. **风险提示保持现有逻辑**

3. **底部按钮样式统一**:
   - 确保使用 `h-12` 高度
   - 底部间距 `pb-8`

---

### 任务 6: 移除旧的币种选择器调用

**修改文件**: `src/pages/Send.tsx`

**变更**:
- 移除 `amount` 步骤中的内联币种切换逻辑
- 移除 `showAssetPicker` 相关 Drawer 和状态
- 金额步骤只显示当前选中币种的余额信息

---

## 文件变更清单

| 文件路径 | 操作 | 说明 |
|---------|------|------|
| `src/components/AssetPickerDrawer.tsx` | 新建 | 增强版币种选择器组件 |
| `src/pages/Send.tsx` | 修改 | 重构步骤流程，新增 asset 步骤 |
| `src/components/skeletons/index.ts` | 修改 | 导出 AssetListSkeleton (如需要) |

---

## 兼容性考虑

1. **URL 参数兼容**: `/send?asset=USDC` 仍然可用，自动跳过币种选择
2. **PSP 预填兼容**: 来自 PSP 页面的转账保持现有跳转逻辑
3. **联系人页面兼容**: 从联系人详情发起的转账，预填地址后从地址步骤开始

---

## 技术细节

### 使用的现有组件
- `ChainSelector` - 链筛选器
- `ChainIcon` - 链图标
- `CryptoIcon` - 币种图标
- `ContactDrawer` - 联系人选择
- `QRScanner` - 扫码
- `NumericKeypad` - 数字键盘
- `AmountDisplay` - 金额显示
- `AddressBar` - 地址栏
- `NetworkFeeSelector` - 网络费用选择

### 状态管理
- 所有状态继续在 `Send.tsx` 内管理
- 新增 `searchQuery` 和 `filterChain` 状态用于币种筛选
- 移除 `showAssetPicker` 状态

---

## 预估工作量

| 任务 | 复杂度 | 预估时间 |
|-----|-------|---------|
| 创建 AssetPickerDrawer | 中 | 15 分钟 |
| 重构 Send.tsx 步骤 | 高 | 20 分钟 |
| 币种选择 UI | 中 | 15 分钟 |
| 地址步骤优化 | 低 | 10 分钟 |
| 确认页面优化 | 低 | 10 分钟 |
| 测试和调整 | 中 | 10 分钟 |
| **总计** | | **约 80 分钟** |
