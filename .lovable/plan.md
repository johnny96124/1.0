
# Toast 两层信息优化方案（精简版）

## 设计原则

### 需要两层信息的场景
1. **复制操作** - 第二层显示具体复制的内容（截断显示）
2. **重要操作完成** - 需要额外说明后续影响或下一步
3. **错误提示** - 需要提供解决方案

### 保持单层信息的场景
1. **简单状态切换** - 手电筒开/关、语言切换
2. **表单验证错误** - 错误信息本身已足够清晰
3. **功能预告** - "即将上线"类提示
4. **操作确认** - 简单的"已完成"类确认

---

## 具体修改清单

### 1. 复制操作（显示具体内容）

| 文件 | 当前 | 修改后 |
|------|------|--------|
| `TransactionDetail.tsx` | `toast.success('发送方地址已复制')` | `toast.success('已复制', formatAddress(addr))` |
| `TransactionDetail.tsx` | `toast.success('收款方地址已复制')` | `toast.success('已复制', formatAddress(addr))` |
| `TransactionDetail.tsx` | `toast.success('已复制到剪贴板')` | `toast.success('已复制', formatTxHash(txHash))` |
| `ChainDropdown.tsx` | `toast.success('${chainName} 地址已复制')` | `toast.success('已复制', formatAddress(address))` |
| `RiskManagement.tsx` | `toast.success('地址已复制')` | `toast.success('已复制', formatAddress(address))` |

地址格式化函数：显示前6位...后4位，如 `0x1234...5678`

---

### 2. 重要操作（需补充说明）

| 文件 | 当前 | 修改后 | 原因 |
|------|------|--------|------|
| `WalletEscape.tsx` | `toast.success('私钥文件已生成')` | `toast.success('私钥文件已生成', '请立即下载并妥善保管')` | 关键安全提示 |
| `WalletEscape.tsx` | `toast.success('MPC 逃逸完成，钱包已转为自托管模式')` | `toast.success('MPC 逃逸完成', '钱包已转为自托管模式')` | 信息分层更清晰 |

---

### 3. 保持单层（无需修改）

以下场景信息已足够完整，保持单层：

- `Home.tsx`: `余额已刷新` - 简单确认
- `Home.tsx`: `已添加 ${symbol}` / `已删除 ${symbol}` - 操作对象已明确
- `PersonalInfo.tsx`: `邮箱绑定成功` / `手机号绑定成功` / `密码设置成功` - 简洁明了
- `LanguageSelectDrawer.tsx`: `语言已切换` - 简单状态
- `QRScanner.tsx`: `已识别收款地址` / `手电筒已打开/关闭` - 即时反馈
- `WalletManagement.tsx`: `钱包已重命名为 "${name}"` - 结果已在消息中
- `PSPPermissions.tsx`: `权限已开启/关闭` - 简单切换

---

## 技术实现

### 新增地址格式化工具函数

在 `src/lib/utils.ts` 中添加：

```typescript
export function formatAddressShort(address: string, prefixLen = 6, suffixLen = 4): string {
  if (!address || address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

export function formatTxHashShort(hash: string): string {
  if (!hash || hash.length <= 14) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}
```

### 文件修改列表

1. **src/lib/utils.ts** - 添加格式化函数
2. **src/pages/TransactionDetail.tsx** - 3处复制Toast
3. **src/components/ChainDropdown.tsx** - 1处复制Toast  
4. **src/pages/RiskManagement.tsx** - 1处复制Toast
5. **src/pages/WalletEscape.tsx** - 2处重要操作Toast

共计 **6个文件**，**8处修改**
