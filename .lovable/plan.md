
# 新用户登录注册流程优化方案

## 需求概述
根据用户反馈，需要优化新用户登录注册流程，主要包含以下几点：
1. 点击"使用验证码登录"时，登录按钮需要显示 loading 状态
2. 新用户默认使用验证码登录（而非密码登录）
3. 新用户登录成功后，强制引导创建新密码
4. 在一个新页面中优化整体流程

---

## 实现方案

### 1. 修复"使用验证码登录"按钮的 loading 状态

**问题分析：** 
当前 `handleSwitchToVerification` 函数会发送验证码，但按钮没有显示 loading 状态。

**解决方案：**
- 新增专门的 loading 状态变量 `isSwitchingToOtp` 
- 在"使用验证码登录"按钮上显示 Loader2 动画

---

### 2. 新用户默认使用验证码登录

**逻辑调整：**
- 在 `checkPasswordExists` 返回结果中，新增 `isNewUser` 字段
- 当检测到新用户（无密码记录）时，直接跳转到验证码流程
- 对于老用户（有密码记录），保持现有逻辑（跳转到密码输入页面）

---

### 3. 新增"设置密码"页面

**创建新页面：** `src/pages/SetPassword.tsx`

**页面功能：**
- 新用户验证码登录成功后，自动跳转到该页面
- 强制用户设置登录密码
- 包含密码强度检测（弱/中/强）
- 密码确认输入
- 提供"跳过"选项（可选，根据安全策略决定是否保留）

**页面 UI 设计：**
- 顶部显示进度指示（可选）
- 密码图标动画
- 新密码输入框（带眼睛可视/隐藏按钮）
- 确认密码输入框
- 密码强度条显示
- 设置完成按钮

---

### 4. 登录流程调整

**修改 `Login.tsx` 中的 `verifyCode` 成功回调：**

```text
当前流程：
验证码验证成功 → 判断用户类型 → 跳转 onboarding/home/create-wallet

优化后流程：
验证码验证成功 → 判断用户类型
  ├── 新用户 → 跳转到 /set-password（设置密码页面）
  └── 老用户 → 跳转 home/create-wallet
```

---

### 5. 路由配置

**在 `App.tsx` 中添加新路由：**
- `/set-password` - 设置密码页面（仅对已认证用户开放）

---

## 技术实现细节

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pages/Login.tsx` | 修改 | 添加按钮 loading 状态、调整新用户登录成功后的跳转逻辑 |
| `src/pages/SetPassword.tsx` | 新建 | 设置密码页面 |
| `src/App.tsx` | 修改 | 添加 `/set-password` 路由 |
| `src/contexts/WalletContext.tsx` | 修改 | 调整 `checkPasswordExists` 返回新用户标识 |

### Login.tsx 关键修改

1. **添加新的 loading 状态：**
```typescript
const [isSwitchingToOtp, setIsSwitchingToOtp] = useState(false);
```

2. **修改 `handleSwitchToVerification` 函数：**
```typescript
const handleSwitchToVerification = async () => {
  setIsSwitchingToOtp(true); // 新增
  try {
    const identifier = loginMethod === 'email' ? email : `${selectedCountry.dialCode}${phone}`;
    await sendVerificationCode(identifier);
    setLoginStep('verification');
    setCountdown(60);
    // ...
  } catch (error) {
    console.error('Send code failed:', error);
  } finally {
    setIsSwitchingToOtp(false); // 新增
  }
};
```

3. **修改"使用验证码登录"按钮：**
```typescript
<button
  onClick={handleSwitchToVerification}
  disabled={isLoading || isSwitchingToOtp}
  className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
>
  {isSwitchingToOtp && <Loader2 className="w-4 h-4 animate-spin" />}
  使用验证码登录
</button>
```

4. **修改验证码成功后的跳转逻辑：**
```typescript
// 在 handleVerifyCode 的成功回调中
setTimeout(() => {
  if (result.userType === 'new') {
    // 新用户跳转到设置密码页面
    navigate('/set-password');
  } else if (result.hasExistingWallets) {
    navigate('/home');
  } else {
    navigate('/create-wallet');
  }
}, 1500);
```

### SetPassword.tsx 页面结构

```text
┌─────────────────────────────────────┐
│  ← 返回                              │
│                                     │
│         🔐 (锁图标，带动画)           │
│                                     │
│        设置登录密码                   │
│    为您的账户设置一个安全密码          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 请输入新密码            👁   │    │
│  └─────────────────────────────┘    │
│                                     │
│  密码强度: ████████░░░░ 中           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 确认密码                👁   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         设置密码              │    │
│  └─────────────────────────────┘    │
│                                     │
│         稍后设置                     │
│                                     │
└─────────────────────────────────────┘
```

### 密码强度计算逻辑

复用现有 `PersonalInfo.tsx` 中的 `getPasswordStrength` 函数：
- 弱: 红色
- 中: 黄色  
- 强: 绿色

---

## 完整用户流程

```text
新用户流程:
输入手机号/邮箱 → 点击继续 → 
→ (后端检测到新用户) → 发送验证码 → 输入验证码 →
→ 登录成功动画 → 跳转设置密码页面 →
→ 设置密码 → 跳转 Onboarding

老用户流程 (有密码):
输入手机号/邮箱 → 点击继续 →
→ (后端检测到有密码) → 密码输入页面 →
→ 登录成功动画 → 跳转 Home

老用户流程 (使用验证码):
密码输入页面 → 点击"使用验证码登录" (显示loading) →
→ 验证码页面 → 登录成功动画 → 跳转 Home
```

---

## 预期结果

1. "使用验证码登录"按钮点击后显示旋转的 loading 图标
2. 新用户无需输入密码即可通过验证码完成注册
3. 新用户登录成功后会被引导至设置密码页面
4. 整体流程更加流畅，用户体验更佳
