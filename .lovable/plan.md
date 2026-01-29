

# 无名称地址在最近交易中的展示优化

## 问题分析

当前实现中，如果联系人没有名称：
- **第一行**：显示截断地址 `0x1234...abcd`
- **第二行**：显示完整地址

这导致**信息重复**，视觉上不够清晰。

---

## 推荐方案：「未命名地址」占位符

保持两行结构的一致性，使用固定占位文案：

### 有名称时

```text
┌─────────────────────────────────────┐
│ 张三                          EVM   │  ← 名称 + 链标签
│ 0x1234567890abcdef1234567890abc...  │  ← 完整地址
└─────────────────────────────────────┘
```

### 无名称时

```text
┌─────────────────────────────────────┐
│ 未命名地址                     EVM   │  ← 占位文案 + 链标签
│ 0x1234567890abcdef1234567890abc...  │  ← 完整地址
└─────────────────────────────────────┘
```

---

## 代码修改

### src/pages/Send.tsx

修改第 603-616 行的渲染逻辑：

**修改前：**
```tsx
<div className="flex items-center gap-2">
  <p className="font-medium text-foreground">
    {contact.name || `${contact.address.slice(0, 8)}...${contact.address.slice(-6)}`}
  </p>
  <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
    {getChainLabel(contact.network)}
  </span>
</div>
<p className="text-sm text-muted-foreground font-mono break-all mt-1">
  {contact.address}
</p>
```

**修改后：**
```tsx
<div className="flex items-center gap-2">
  <p className={cn(
    "font-medium",
    contact.name ? "text-foreground" : "text-muted-foreground"
  )}>
    {contact.name || '未命名地址'}
  </p>
  <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
    {getChainLabel(contact.network)}
  </span>
</div>
<p className="text-sm text-muted-foreground font-mono break-all mt-1">
  {contact.address}
</p>
```

---

## 视觉效果对比

| 场景 | 第一行 | 第二行 |
|------|--------|--------|
| 有名称 | **张三** `EVM` | `0x1234...` (完整地址) |
| 无名称 | *未命名地址* `EVM` | `0x1234...` (完整地址) |

- 有名称时，名称使用 `text-foreground`（深色/醒目）
- 无名称时，「未命名地址」使用 `text-muted-foreground`（灰色/弱化），暗示这是占位符
- 两种情况下结构完全一致，用户体验统一

---

## 文件变更

| 文件 | 改动 |
|------|------|
| `src/pages/Send.tsx` | 修改最近交易列表中名称显示逻辑，改为「未命名地址」占位符 |

