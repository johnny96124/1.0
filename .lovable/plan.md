
# 统一回退按钮样式方案

## 问题分析

当前产品中存在多种回退按钮样式，需要统一为带圆角矩形版本（非圆形遮罩版本）：

### 当前存在圆形回退按钮的位置

| 文件 | 位置 | 当前样式 |
|------|------|----------|
| `AppLayout.tsx` | 第61行 | `h-10 w-10 rounded-full` |
| `Send.tsx` | 第312行 | `w-10 h-10 rounded-full bg-muted` |
| `SwipeBack.tsx` | 第90行 | `w-10 h-10 rounded-full` (滑动指示器) |

### 当前已经是正确样式的按钮（无需修改）

| 文件 | 样式 | 说明 |
|------|------|------|
| `TokenManager.tsx` | `Button variant="ghost" size="icon"` | 使用按钮组件默认圆角 |
| `AssetDetail.tsx` | `Button variant="ghost" size="icon"` | 使用按钮组件默认圆角 |
| `RiskReturn.tsx` | `Button variant="ghost" size="icon"` | 使用按钮组件默认圆角 |
| `WalletEscape.tsx` | `Button variant="ghost" size="icon"` | 使用按钮组件默认圆角 |
| `CreateWallet.tsx` | `p-1 -ml-1` 无圆形 | 极简样式，无背景 |
| `TssKeyRecovery.tsx` | `p-1 -ml-1` 无圆形 | 极简样式，无背景 |

---

## 修改方案

### 1. AppLayout.tsx（核心布局组件）

**当前代码：**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleBack}
  className="h-10 w-10 -ml-2 rounded-full hover:bg-muted"
>
```

**修改为：**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleBack}
  className="h-10 w-10 -ml-2 rounded-lg hover:bg-muted"
>
```

### 2. Send.tsx（转账页面）

**当前代码：**
```tsx
<button
  onClick={handleBack}
  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
>
```

**修改为：**
```tsx
<button
  onClick={handleBack}
  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
>
```

### 3. SwipeBack.tsx（滑动返回指示器）

**当前代码：**
```tsx
<div className="w-10 h-10 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
```

**修改为：**
```tsx
<div className="w-10 h-10 rounded-lg bg-muted/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
```

---

## 技术细节

修改非常简单，只需将三个文件中的 `rounded-full` 替换为 `rounded-lg`：
- `rounded-full` = 完全圆形（border-radius: 9999px）
- `rounded-lg` = 圆角矩形（border-radius: 0.5rem / 8px）

这将使所有回退按钮与 Button 组件的默认圆角保持一致（按钮组件默认使用 `rounded-lg`）。

---

## 影响范围

修改这三个文件后，以下页面的回退按钮样式将统一：
- 所有使用 `AppLayout` 的页面（收款、历史、个人设置等）
- 转账页面
- 所有支持滑动返回手势的页面指示器
