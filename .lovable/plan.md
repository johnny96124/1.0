
# 返回按钮统一改造方案

## 改造目标
将所有页面的返回按钮统一为 ChevronLeft 样式，使用 AppLayout 组件实现标准化的顶部导航栏。

---

## 当前状态分析

### 标准样式 (AppLayout + ChevronLeft)
已使用标准样式的页面（无需修改）：
- `Contacts.tsx` - `<AppLayout title="地址簿" showBack>`
- `Receive.tsx` - `<AppLayout showBack title="收款">`
- `RiskManagement.tsx` - `<AppLayout title="风险资金处置" showBack>`
- `Security.tsx` - `<AppLayout title="安全与风控" showBack>`
- `Help.tsx` - `<AppLayout title="帮助与支持" showBack>`
- `History.tsx` - `<AppLayout title="交易历史" showBack>`

### 非标准样式 (ArrowLeft)
需要改造的页面：

| 页面 | 当前实现 | 特殊性 |
|------|----------|--------|
| TransactionDetail.tsx | 自定义 header + ArrowLeft | 普通详情页 |
| WalletManagement.tsx | AppLayout + 内部自定义 header | 有 header 内容重复 |
| AssetDetail.tsx | AppLayout + 内部自定义 header | 有链选择器 |
| PersonalInfo.tsx | AppLayout + 内部自定义 header | 标题左对齐 |
| Send.tsx | AppLayout + 内部自定义 header | 多步骤流程 |
| CreateWallet.tsx | 自定义 header + ArrowLeft | 步骤指示器 |
| TssKeyRecovery.tsx | 自定义 header + ArrowLeft | 步骤指示器 |
| SetPassword.tsx | 自定义 header + ArrowLeft | 普通表单页 |
| WalletEscape.tsx | 自定义 header + ArrowLeft | 多步骤流程 |
| RiskReturn.tsx | 自定义 header + ArrowLeft | 条件性返回 |
| CloudRecoveryUnavailable.tsx | 自定义 header + ArrowLeft | 普通页面 |
| SecurityRequired.tsx | 自定义 header + ArrowLeft | 普通页面 |
| BindEmailDemo.tsx | 自定义 header + ArrowLeft | 标题左对齐 |

---

## 改造策略

### 类型一：简单页面（直接使用 AppLayout header）
直接使用 AppLayout 的 `showBack` 和 `title` 属性，移除内部自定义 header。

**适用页面**：
- TransactionDetail.tsx
- SetPassword.tsx
- CloudRecoveryUnavailable.tsx
- SecurityRequired.tsx
- BindEmailDemo.tsx
- WalletManagement.tsx
- PersonalInfo.tsx

### 类型二：多步骤流程页面（保留步骤指示器）
这类页面有步骤进度条，需要保留步骤指示器但替换返回按钮图标。

**适用页面**：
- CreateWallet.tsx
- TssKeyRecovery.tsx
- WalletEscape.tsx
- Send.tsx

**改造方式**：将 ArrowLeft 替换为 ChevronLeft，保持其余布局不变。

### 类型三：特殊 header 页面（需要额外内容）
部分页面 header 下方有额外内容（如链选择器），需要保留这些内容。

**适用页面**：
- AssetDetail.tsx（有代币信息 + 链选择器）

**改造方式**：使用 AppLayout 的 showBack，但保留 header 下方的特殊内容。

---

## 实现步骤

### 第一批：简单页面改造（7个文件）

#### 1. TransactionDetail.tsx
```text
修改前：
<header className="flex items-center px-4 py-3 ...">
  <button onClick={...}>
    <ArrowLeft className="w-5 h-5" />
  </button>
  <h1>交易详情</h1>
</header>

修改后：
使用 AppLayout title="交易详情" showBack
移除内部 header
```

#### 2. SetPassword.tsx
使用 `<AppLayout showBack title="设置密码" showNav={false}>` 包裹

#### 3. CloudRecoveryUnavailable.tsx
使用 `<AppLayout showBack showNav={false}>` 包裹（无标题）

#### 4. SecurityRequired.tsx
使用 `<AppLayout showBack title="安全认证" showNav={false}>` 包裹

#### 5. BindEmailDemo.tsx
使用 `<AppLayout showBack title="账号绑定演示" showNav={false}>` 包裹

#### 6. WalletManagement.tsx
已使用 AppLayout，只需：
- 移除内部自定义 header
- 添加 `showBack title="钱包管理"` 属性

#### 7. PersonalInfo.tsx
已使用 AppLayout，只需：
- 移除内部自定义 header
- 添加 `showBack title="个人信息"` 属性

---

### 第二批：多步骤流程页面（4个文件）

#### 1. CreateWallet.tsx
将第 88 行 `<ArrowLeft className="w-5 h-5" />` 改为：
```tsx
<ChevronLeft className="w-6 h-6" />
```
并更新按钮样式匹配 AppLayout header。

#### 2. TssKeyRecovery.tsx
将第 162 行 `<ArrowLeft className="w-5 h-5" />` 改为：
```tsx
<ChevronLeft className="w-6 h-6" />
```

#### 3. WalletEscape.tsx
将第 569 行 `<ArrowLeft className="w-5 h-5" />` 改为：
```tsx
<ChevronLeft className="w-6 h-6" />
```

#### 4. Send.tsx
将第 328 行 `<ArrowLeft className="w-5 h-5" />` 改为：
```tsx
<ChevronLeft className="w-6 h-6" />
```
并调整按钮样式。

---

### 第三批：特殊页面（2个文件）

#### 1. AssetDetail.tsx
使用 AppLayout 的 showBack 属性，但保留代币信息和链选择器：

```text
修改前：
<AppLayout showNav={false}>
  <div className="h-full flex flex-col">
    <div className="px-4 py-3 border-b ..."> ← 自定义 header
      <Button ...><ArrowLeft /></Button>
      <CryptoIcon /> <h1>USDT</h1>
    </div>
    <ChainSelector />
  </div>
</AppLayout>

修改后：
<AppLayout showNav={false} showBack title="USDT" onBack={...}>
  <div>
    <ChainSelector /> ← 保留
    ... 内容 ...
  </div>
</AppLayout>
```

需要调整：title 动态显示代币 symbol，代币图标可以作为 leftElement 扩展 AppLayout。

#### 2. RiskReturn.tsx
该页面根据步骤条件显示返回按钮，改为使用 ChevronLeft 图标。

---

## 文件变更清单

| 文件 | 操作类型 | 预估改动量 |
|------|----------|------------|
| TransactionDetail.tsx | 重构 header | 约 15 行 |
| SetPassword.tsx | 添加 AppLayout wrapper | 约 20 行 |
| CloudRecoveryUnavailable.tsx | 添加 AppLayout wrapper | 约 15 行 |
| SecurityRequired.tsx | 添加 AppLayout wrapper | 约 15 行 |
| BindEmailDemo.tsx | 修改 AppLayout props | 约 10 行 |
| WalletManagement.tsx | 移除内部 header | 约 10 行 |
| PersonalInfo.tsx | 移除内部 header | 约 15 行 |
| CreateWallet.tsx | 替换图标 | 约 5 行 |
| TssKeyRecovery.tsx | 替换图标 | 约 5 行 |
| WalletEscape.tsx | 替换图标 | 约 5 行 |
| Send.tsx | 替换图标 + 样式调整 | 约 10 行 |
| AssetDetail.tsx | 重构 header 区域 | 约 25 行 |
| RiskReturn.tsx | 替换图标 | 约 5 行 |

**总计**：13 个文件，约 155 行代码改动

---

## 技术细节

### 统一的 header 样式规范
所有页面使用 AppLayout 后的标准样式：

```text
┌──────────────────────────────────────────┐
│  ‹  │          页面标题          │      │
│ 10w │         居中显示           │ 10w  │
│ ────│───────────────────────────│──────│
│ bg-muted/30 backdrop-blur-sm border-b   │
└──────────────────────────────────────────┘
```

- 返回按钮：`ChevronLeft w-6 h-6`
- 按钮容器：`h-10 w-10 rounded-full hover:bg-muted`
- 标题：`text-lg font-semibold text-foreground` 居中
- 背景：`bg-muted/30 backdrop-blur-sm border-b border-border/50`

### 导入变更
移除 ArrowLeft 导入，添加 ChevronLeft 导入（如需保留自定义 header）：

```tsx
// 移除
import { ArrowLeft, ... } from 'lucide-react';

// 改为（如需自定义）
import { ChevronLeft, ... } from 'lucide-react';
```

对于使用 AppLayout 的页面，无需导入图标。
