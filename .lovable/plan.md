
# 最近交易：Mock 一个不带名称的地址

## 需求确认
- 保持 3 个最近交易记录
- 其中一个地址不带名称（仅显示地址）

---

## 改造方案

### 修改 WalletContext.tsx 中的 mockContacts

将第三个联系人（PSP Official Settlement）的 `name` 改为空字符串，模拟一个只有地址、没有名称的交易记录。

**修改前（第 495-503 行）：**
```typescript
{
  id: '3',
  name: 'PSP Official Settlement',
  address: '0xOFFICIAL1234567890abcdef1234567890abcd',
  network: 'ethereum',
  tags: ['Official'],
  isOfficial: true,
  isWhitelisted: true,
},
```

**修改后：**
```typescript
{
  id: '3',
  name: '',  // 空名称，模拟仅有地址的记录
  address: '0x7a3F9c2B8e4D1f5A6b3C9e8D7f2A1b4C5d6E7f8A',
  network: 'ethereum',
  tags: [],
  isOfficial: false,
  isWhitelisted: false,  // 不是白名单
},
```

### 修改 Send.tsx 中的显示逻辑

目前代码直接显示 `contact.name`，需要处理空名称的情况：

**修改前（第 622 行）：**
```tsx
<p className="font-medium text-foreground">{contact.name}</p>
```

**修改后：**
```tsx
<p className="font-medium text-foreground">
  {contact.name || `${contact.address.slice(0, 8)}...${contact.address.slice(-6)}`}
</p>
```

这样当 `name` 为空时，会显示截断的地址格式（如 `0x7a3F9c...7f8A`）。

---

## 预期效果

最近交易列表将显示：
1. **ABC Trading Co.** - 白名单标签 + 地址
2. **Supplier XYZ** - 白名单标签 + 地址  
3. **0x7a3F9c...7f8A** - 无标签，仅显示地址

---

## 文件变更清单

| 文件 | 操作 | 改动量 |
|------|------|--------|
| src/contexts/WalletContext.tsx | 修改第 3 个联系人数据 | ~5 行 |
| src/pages/Send.tsx | 处理空名称显示 | ~3 行 |

**总计**：2 个文件，约 8 行代码改动
