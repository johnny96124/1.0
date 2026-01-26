
# 手机号和邮箱换绑流程设计方案

## 需求概述

在现有的绑定流程基础上，增加**换绑功能**，让已绑定账号的用户可以更换绑定的手机号或邮箱。换绑流程需要先验证原账号的所有权，再绑定新账号，确保安全性。

---

## 换绑流程设计

### 流程图

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           换绑流程                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: 验证原账号        Step 2: 输入新账号        Step 3: 验证新账号  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐│
│  │ 显示当前绑定账号  │     │ 输入新邮箱/手机号 │     │   输入验证码     ││
│  │ 发送验证码到原账号│ --> │ (或 OAuth 登录)  │ --> │   验证通过      ││
│  │ 输入验证码验证   │     │  发送验证码      │     │   换绑成功      ││
│  └─────────────────┘     └─────────────────┘     └─────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 安全设计

| 步骤 | 目的 | 验证方式 |
|------|------|----------|
| 验证原账号 | 确认是账号所有者 | 发送验证码到原绑定账号 |
| 绑定新账号 | 确认新账号有效且属于用户 | 发送验证码到新账号 / OAuth授权 |

---

## Demo 页面扩展

### 页面结构改造

将 `BindEmailDemo` 页面扩展为完整的**账号绑定演示中心**，支持：

1. 绑定邮箱（首次绑定）
2. 绑定手机号（首次绑定）
3. 换绑邮箱（已有绑定时）
4. 换绑手机号（已有绑定时）

```text
┌─────────────────────────────────┐
│  ← 账号绑定演示                  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📧 邮箱                  │    │
│  │ 已绑定: us****@gmail.com│    │
│  │              [换绑邮箱]  │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📱 手机号                │    │
│  │ 未绑定                   │    │
│  │           [绑定手机号]   │    │
│  └─────────────────────────┘    │
│                                 │
│  [重置所有绑定]                  │
│                                 │
│  提示：演示模式下，任意6位验证码可通过│
└─────────────────────────────────┘
```

---

## 技术实现

### 1. 修改 BindAccountDrawer 组件

新增 Props 和 Step：

```typescript
interface BindAccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'email' | 'phone';
  mode: 'bind' | 'rebind';        // 新增：绑定模式
  currentValue?: string;           // 新增：当前绑定值（换绑时使用）
  onSuccess?: (value: string) => void;
}

type BindStep = 
  | 'verify-old'      // 新增：验证原账号
  | 'input'           // 输入新账号
  | 'verification'    // 验证新账号
  | 'success';        // 成功
```

### 2. 新增验证原账号步骤

换绑模式下，首先显示当前绑定的账号，要求用户验证：

```text
┌─────────────────────────────┐
│         换绑邮箱             │
├─────────────────────────────┤
│                             │
│      [🔒 安全验证图标]       │
│                             │
│  为确保账号安全，请先验证     │
│  当前绑定的邮箱所有权         │
│                             │
│  当前邮箱: us****@gmail.com  │
│                             │
│  [ 发送验证码到原邮箱 ]       │
│                             │
└─────────────────────────────┘
```

### 3. 完整状态流转

```text
换绑模式（mode = 'rebind'）:
  verify-old -> input -> verification -> success
     │           │            │
     │           │            └─> 验证新账号的验证码
     │           └─> 输入新账号 / OAuth
     └─> 验证原账号的验证码

绑定模式（mode = 'bind'）:
  input -> verification -> success
    │           │
    │           └─> 验证新账号的验证码
    └─> 输入新账号 / OAuth
```

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/BindAccountDrawer.tsx` | 修改 | 增加换绑模式和验证原账号步骤 |
| `src/pages/BindEmailDemo.tsx` | 修改 | 扩展为完整账号绑定演示中心 |

---

## 详细代码实现

### BindAccountDrawer.tsx 改动

1. **新增 Props**：
```tsx
interface BindAccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'email' | 'phone';
  mode?: 'bind' | 'rebind';       // 默认 'bind'
  currentValue?: string;          // 换绑时的当前值
  onSuccess?: (value: string) => void;
}
```

2. **新增状态**：
```tsx
type BindStep = 'verify-old' | 'input' | 'verification' | 'success';
const [oldCode, setOldCode] = useState('');
const [oldCodeError, setOldCodeError] = useState('');
```

3. **新增验证原账号 UI**（Step: verify-old）：
   - 显示安全验证图标和提示文案
   - 显示当前绑定的脱敏账号
   - "发送验证码到原账号" 按钮
   - 6位验证码输入框
   - 验证通过后进入 input 步骤

4. **修改标题逻辑**：
```tsx
const title = mode === 'rebind' 
  ? (isEmail ? '换绑邮箱' : '换绑手机号')
  : (isEmail ? '绑定邮箱' : '绑定手机号');
```

### BindEmailDemo.tsx 改动

1. **重命名为账号绑定演示中心**

2. **新增状态**：
```tsx
const [boundPhone, setBoundPhone] = useState<string | null>(null);
const [drawerType, setDrawerType] = useState<'email' | 'phone'>('email');
const [drawerMode, setDrawerMode] = useState<'bind' | 'rebind'>('bind');
```

3. **新增操作函数**：
```tsx
const handleOpenDrawer = (type: 'email' | 'phone', mode: 'bind' | 'rebind') => {
  setDrawerType(type);
  setDrawerMode(mode);
  setDrawerOpen(true);
};
```

4. **UI 改造为账号卡片列表**：
   - 邮箱卡片：显示绑定状态，按钮为"绑定"或"换绑"
   - 手机卡片：显示绑定状态，按钮为"绑定"或"换绑"
   - 重置按钮：清空所有绑定

---

## 用户体验流程

### 场景1：首次绑定邮箱

1. 点击"绑定邮箱" → 打开 Drawer（mode=bind）
2. 选择 Google/Apple OAuth 或手动输入邮箱
3. 输入验证码
4. 绑定成功

### 场景2：换绑邮箱

1. 点击"换绑邮箱" → 打开 Drawer（mode=rebind）
2. 显示当前绑定邮箱（脱敏），点击"发送验证码到原邮箱"
3. 输入原邮箱收到的验证码，验证通过
4. 选择新邮箱（OAuth 或手动输入）
5. 输入新邮箱收到的验证码
6. 换绑成功

### 场景3：首次绑定手机号

1. 点击"绑定手机号" → 打开 Drawer（mode=bind）
2. 选择国家区号，输入手机号
3. 输入验证码
4. 绑定成功

### 场景4：换绑手机号

1. 点击"换绑手机号" → 打开 Drawer（mode=rebind）
2. 显示当前绑定手机号（脱敏），发送验证码
3. 输入原手机收到的验证码，验证通过
4. 输入新手机号
5. 输入新手机收到的验证码
6. 换绑成功
