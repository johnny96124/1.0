
# Add Password Verification Option to Phone/Email Rebind Flow

## Overview
Currently, when users want to rebind their phone number or email, they must verify their identity by receiving an OTP code on their **current** bound account. Since all users now have a password (mandatory during onboarding), we will add an alternative verification method: users can choose to verify using their password instead of OTP.

## User Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Current Rebind Flow                        │
│                                                                 │
│  1. User clicks "换绑" on phone/email                           │
│  2. Drawer opens → "安全验证" step                              │
│  3. User must verify via OTP to current bound account           │
│  4. After verification → Enter new account                      │
│  5. Verify new account via OTP                                  │
│  6. Success                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Enhanced Rebind Flow                          │
│                                                                 │
│  1. User clicks "换绑" on phone/email                           │
│  2. Drawer opens → "安全验证" step                              │
│  3. Two verification options:                                   │
│     a) OTP to current bound account (existing flow)             │
│     b) Password verification (NEW)                              │
│  4. After verification → Enter new account                      │
│  5. Verify new account via OTP                                  │
│  6. Success                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## UI Design (Based on Reference Screenshots)

In the "安全验证" step (verify-old), we will add a link at the bottom of the drawer:

```text
┌─────────────────────────────────────────────────┐
│  安全验证                                        │
├─────────────────────────────────────────────────┤
│                                                 │
│              [Shield Icon]                      │
│                                                 │
│  为确保账号安全，请先验证当前绑定的手机号          │
│                                                 │
│            +86 138****1234                      │
│                                                 │
│     ┌─────────────────────────────────────┐     │
│     │      发送验证码到原手机号            │     │
│     └─────────────────────────────────────┘     │
│                                                 │
│         ───────── 或 ─────────                  │
│                                                 │
│            使用密码验证 →                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

When user clicks "使用密码验证", the view switches to a password input mode:

```text
┌─────────────────────────────────────────────────┐
│  ← 安全验证                                      │
├─────────────────────────────────────────────────┤
│                                                 │
│              [Lock Icon]                        │
│                                                 │
│         请输入登录密码以验证身份                  │
│                                                 │
│     ┌─────────────────────────────────────┐     │
│     │  ••••••••                       👁   │     │
│     └─────────────────────────────────────┘     │
│                                                 │
│     ┌─────────────────────────────────────┐     │
│     │              确认                    │     │
│     └─────────────────────────────────────┘     │
│                                                 │
│         使用验证码验证 →                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Modify

1. **`src/components/BindAccountDrawer.tsx`** - Main changes

### Changes Required

#### 1. Add New Props
- Add `hasPassword?: boolean` prop to indicate if password verification is available

#### 2. Add New State Variables
```typescript
// Password verification mode
const [verifyMode, setVerifyMode] = useState<'otp' | 'password'>('otp');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [passwordError, setPasswordError] = useState('');
```

#### 3. Add Password Verification Handler
```typescript
const handleVerifyPassword = async () => {
  setIsLoading(true);
  setPasswordError('');
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const savedPassword = localStorage.getItem('user_password');
  if (password !== savedPassword) {
    setPasswordError('密码不正确');
    setIsLoading(false);
    return;
  }
  
  setIsLoading(false);
  setStep('input'); // Proceed to new account input
};
```

#### 4. Update the "verify-old" Step UI
- When `verifyMode === 'otp'`:
  - Show current OTP verification UI
  - Add divider and "使用密码验证 →" link at the bottom (only if `hasPassword` is true)
- When `verifyMode === 'password'`:
  - Show password input field with visibility toggle
  - Show confirm button
  - Add "使用验证码验证 →" link at the bottom to switch back

#### 5. Update Reset Logic
- Reset `verifyMode` to 'otp' when drawer closes
- Reset password-related state (`password`, `passwordError`, `showPassword`)

#### 6. Update Back Navigation
- When in password mode, back arrow returns to OTP mode (not closing drawer)

### Update PersonalInfo.tsx

Pass the `hasPassword` prop when opening BindAccountDrawer:

```typescript
<BindAccountDrawer
  open={bindDrawerOpen}
  onOpenChange={setBindDrawerOpen}
  type={bindType}
  mode={bindMode}
  currentValue={currentBindValue}
  onSuccess={handleBindSuccess}
  hasPassword={hasExistingPassword}  // NEW
/>
```

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/BindAccountDrawer.tsx` | Add password verification mode with toggle between OTP and password in the verify-old step |
| `src/pages/PersonalInfo.tsx` | Pass `hasExistingPassword` prop to BindAccountDrawer |
