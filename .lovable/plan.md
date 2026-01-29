
# 移除全局按钮图标

## 概述
全局搜索应用中所有带有图标的 `<Button>` 组件，并移除按钮内的图标元素，保留纯文字按钮样式。

---

## 影响范围分析

经过全面代码审查，发现以下文件包含带图标的 `<Button>` 组件：

### 高优先级（主要交互按钮）

| 文件 | 按钮文字 | 图标 | 改动行 |
|------|----------|------|--------|
| `src/pages/Home.tsx` | 转账 / 收款 | Send / QrCode | ~368-378 |
| `src/pages/Send.tsx` | 授权中(loading) | Loader2 | ~866 |
| `src/pages/Receive.tsx` | 复制地址 / 保存二维码 | Copy,Check / Download | ~306-325 |
| `src/pages/Onboarding.tsx` | 授权安全认证 | Lock | ~283-286 |
| `src/pages/Onboarding.tsx` | 备份到 iCloud | CloudUpload,Loader2 | ~651-657 |
| `src/pages/TransactionDetail.tsx` | 退回资金 | RotateCcw | ~390-397 |
| `src/pages/RiskManagement.tsx` | 退回资金 / 我已知晓风险 | RotateCcw / Eye | ~447-462 |
| `src/components/RbfActionSection.tsx` | 加速交易 / 取消交易 | Rocket / X | ~44-57 |
| `src/components/SpeedUpDrawer.tsx` | 确认加速 | Rocket | ~139-145 |
| `src/components/CancelTxDrawer.tsx` | 确认取消 | X | ~71-78 |
| `src/pages/Contacts.tsx` | 添加第一个联系人 | Plus | ~132-138 |
| `src/pages/PSPCenter.tsx` | 添加服务商 | Plus | ~233-236 |
| `src/pages/ContactForm.tsx` | 保存中(loading) | Loader2 | ~345-350 |

### 无需修改的情况

- **图标按钮 (size="icon")**: 如 `<Button variant="ghost" size="icon">` 只包含图标，无文字，保持不变
- **普通 `<button>` 元素**: 非 `<Button>` 组件的原生按钮不在此次修改范围
- **AlertDialogAction/Cancel**: 这些是 Dialog 内的动作按钮，通常无图标

---

## 修改方案

### 1. src/pages/Home.tsx (2处)

**第368-378行** - 首页快捷操作按钮

修改前：
```tsx
<Button className="flex-1 h-10 gradient-accent text-accent-foreground" onClick={() => navigate('/send')}>
  <Send className="w-4 h-4 mr-2" />
  转账
</Button>
<Button variant="outline" className="flex-1 h-10" onClick={() => navigate('/receive')}>
  <QrCode className="w-4 h-4 mr-2" />
  收款
</Button>
```

修改后：
```tsx
<Button className="flex-1 h-10 gradient-accent text-accent-foreground" onClick={() => navigate('/send')}>
  转账
</Button>
<Button variant="outline" className="flex-1 h-10" onClick={() => navigate('/receive')}>
  收款
</Button>
```

---

### 2. src/pages/Home.tsx (1处)

**第119行** - 创建钱包按钮

修改前：
```tsx
<Button size="lg" className="w-full text-base gradient-primary" onClick={() => navigate('/onboarding')}>
  <Plus className="w-5 h-5 mr-2" />
  创建钱包
</Button>
```

修改后：
```tsx
<Button size="lg" className="w-full text-base gradient-primary" onClick={() => navigate('/onboarding')}>
  创建钱包
</Button>
```

---

### 3. src/pages/Send.tsx (1处)

**第866行** - 确认按钮 (loading状态保留Loader图标)

修改前：
```tsx
{isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
{step === 'confirm' ? '确认并转账' : '继续'}
```

修改后：
```tsx
{isLoading ? '处理中...' : (step === 'confirm' ? '确认并转账' : '继续')}
```

---

### 4. src/pages/Receive.tsx (2处)

**第306-325行** - 复制/保存按钮

修改前：
```tsx
<Button variant="outline" className="flex-1 h-10" onClick={handleCopy}>
  {copied ? (
    <Check className="w-4 h-4 mr-2 text-success" />
  ) : (
    <Copy className="w-4 h-4 mr-2" />
  )}
  复制地址
</Button>
<Button className="flex-1 h-10" onClick={handleSaveQRCode} disabled={saving}>
  <Download className="w-4 h-4 mr-2" />
  {saving ? '保存中...' : '保存二维码'}
</Button>
```

修改后：
```tsx
<Button variant="outline" className="flex-1 h-10" onClick={handleCopy}>
  {copied ? '已复制' : '复制地址'}
</Button>
<Button className="flex-1 h-10" onClick={handleSaveQRCode} disabled={saving}>
  {saving ? '保存中...' : '保存二维码'}
</Button>
```

---

### 5. src/pages/Onboarding.tsx (3处)

**第283-286行** - 授权安全认证

修改前：
```tsx
{isLoading ? (
  <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
) : (
  <Lock className="w-5 h-5 mr-2" strokeWidth={1.5} />
)}
授权安全认证
```

修改后：
```tsx
{isLoading ? '授权中...' : '授权安全认证'}
```

**第651-657行** - 备份到 iCloud

修改前：
```tsx
{isLoading ? (
  <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
) : (
  <CloudUpload className="w-5 h-5 mr-2" strokeWidth={1.5} />
)}
备份到 iCloud
```

修改后：
```tsx
{isLoading ? '备份中...' : '备份到 iCloud'}
```

---

### 6. src/pages/TransactionDetail.tsx (1处)

**第390-397行** - 退回资金

修改前：
```tsx
<Button variant="destructive" className="w-full gap-2 h-12" onClick={() => handleReturn(transaction.id)}>
  <RotateCcw className="w-4 h-4" />
  退回资金
</Button>
```

修改后：
```tsx
<Button variant="destructive" className="w-full h-12" onClick={() => handleReturn(transaction.id)}>
  退回资金
</Button>
```

---

### 7. src/pages/RiskManagement.tsx (2处)

**第447-462行** - 退回资金 / 我已知晓风险

修改前：
```tsx
<Button variant="destructive" className="w-full gap-2" onClick={() => handleReturn(selectedTx.id)}>
  <RotateCcw className="w-4 h-4" />
  退回资金
</Button>
<Button variant="outline" className="w-full gap-2" onClick={() => handleAcknowledge(selectedTx.id)}>
  <Eye className="w-4 h-4" />
  我已知晓风险
</Button>
```

修改后：
```tsx
<Button variant="destructive" className="w-full" onClick={() => handleReturn(selectedTx.id)}>
  退回资金
</Button>
<Button variant="outline" className="w-full" onClick={() => handleAcknowledge(selectedTx.id)}>
  我已知晓风险
</Button>
```

---

### 8. src/components/RbfActionSection.tsx (2处)

**第44-57行** - 加速/取消交易

修改前：
```tsx
<Button variant="default" className="flex-1 gap-2 h-10" onClick={onSpeedUp}>
  <Rocket className="w-4 h-4" />
  加速交易
</Button>
<Button variant="outline" className="flex-1 gap-2 h-10" onClick={onCancel}>
  <X className="w-4 h-4" />
  取消交易
</Button>
```

修改后：
```tsx
<Button variant="default" className="flex-1 h-10" onClick={onSpeedUp}>
  加速交易
</Button>
<Button variant="outline" className="flex-1 h-10" onClick={onCancel}>
  取消交易
</Button>
```

---

### 9. src/components/SpeedUpDrawer.tsx (1处)

**第139-145行** - 确认加速

修改前：
```tsx
<Button className="w-full gap-2 h-12" onClick={handleConfirm}>
  <Rocket className="w-4 h-4" />
  确认加速
</Button>
```

修改后：
```tsx
<Button className="w-full h-12" onClick={handleConfirm}>
  确认加速
</Button>
```

---

### 10. src/components/CancelTxDrawer.tsx (1处)

**第71-78行** - 确认取消

修改前：
```tsx
<Button variant="destructive" className="w-full gap-2 h-12" onClick={handleConfirm}>
  <X className="w-4 h-4" />
  确认取消
</Button>
```

修改后：
```tsx
<Button variant="destructive" className="w-full h-12" onClick={handleConfirm}>
  确认取消
</Button>
```

---

### 11. src/pages/Contacts.tsx (1处)

**第132-138行** - 添加第一个联系人

修改前：
```tsx
<Button onClick={() => navigate('/profile/contacts/add')} className="gap-2">
  <Plus className="w-4 h-4" />
  添加第一个联系人
</Button>
```

修改后：
```tsx
<Button onClick={() => navigate('/profile/contacts/add')}>
  添加第一个联系人
</Button>
```

---

### 12. src/pages/PSPCenter.tsx (1处)

**第233-236行** - 添加服务商

修改前：
```tsx
<Button onClick={onConnect} className="gradient-accent gap-2">
  <Plus className="w-4 h-4" />
  添加服务商
</Button>
```

修改后：
```tsx
<Button onClick={onConnect} className="gradient-accent">
  添加服务商
</Button>
```

---

### 13. src/pages/ContactForm.tsx (1处)

**第345-350行** - 保存/添加按钮 (loading状态)

修改前：
```tsx
{isSaving ? (
  <>
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    保存中...
  </>
) : (
  isEditing ? '保存修改' : '添加联系人'
)}
```

修改后：
```tsx
{isSaving ? '保存中...' : (isEditing ? '保存修改' : '添加联系人')}
```

---

## 清理未使用的图标导入

移除按钮图标后，需要检查每个文件中未使用的图标导入，并删除：

- `Home.tsx`: Send, QrCode, Plus (检查是否其他地方使用)
- `Receive.tsx`: Copy, Download, Check (检查是否其他地方使用)  
- `Onboarding.tsx`: Lock, CloudUpload (检查是否其他地方使用)
- `RbfActionSection.tsx`: Rocket, X (可能完全移除)
- 其他文件类似

---

## 文件变更汇总

| 文件 | 修改处数 | 改动类型 |
|------|----------|----------|
| `src/pages/Home.tsx` | 3 | 移除图标 |
| `src/pages/Send.tsx` | 1 | 移除loading图标 |
| `src/pages/Receive.tsx` | 2 | 移除图标，调整文字 |
| `src/pages/Onboarding.tsx` | 2 | 移除图标，调整loading文字 |
| `src/pages/TransactionDetail.tsx` | 1 | 移除图标 |
| `src/pages/RiskManagement.tsx` | 2 | 移除图标 |
| `src/pages/Contacts.tsx` | 1 | 移除图标 |
| `src/pages/PSPCenter.tsx` | 1 | 移除图标 |
| `src/pages/ContactForm.tsx` | 1 | 移除loading图标 |
| `src/components/RbfActionSection.tsx` | 2 | 移除图标 |
| `src/components/SpeedUpDrawer.tsx` | 1 | 移除图标 |
| `src/components/CancelTxDrawer.tsx` | 1 | 移除图标 |

**总计**: 12 个文件，约 18 处修改
