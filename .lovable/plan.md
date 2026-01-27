
# Onboarding流程重构方案

## 目标
将onboarding流程整合为一个完整的链路：登录 → 强制设置密码 → 创建钱包 → 备份 → 进入首页

## 当前流程分析

```text
当前流程存在的问题：
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────┐
│  Login  │ -> │ SetPassword │ -> │ Onboarding  │ -> │ Home │
└─────────┘    └─────────────┘    └─────────────┘    └──────┘
                     ↓
              可以跳过 (稍后设置)
```

## 重构后流程

```text
Onboarding新用户流程（强制密码设置）：
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────┐
│  Login  │ -> │ SetPassword │ -> │ Onboarding  │ -> │ Home │
└─────────┘    └─────────────┘    └─────────────┘    └──────┘
 (new=true)    (不可跳过)        (钱包创建+备份)

默认登录流程（老用户）：
┌─────────┐    ┌──────┐
│  Login  │ -> │ Home │
└─────────┘    └──────┘
```

## 技术方案

### 1. 新增Onboarding状态管理

在 `WalletContext` 中添加onboarding状态：

```typescript
interface OnboardingState {
  isOnboarding: boolean;        // 是否在onboarding流程中
  passwordRequired: boolean;    // 是否需要强制设置密码
  passwordSet: boolean;         // 密码是否已设置
}
```

### 2. 修改 Login.tsx

**变更内容：**
- 新用户首次登录时，设置 `isOnboarding: true`
- 导航到 `/set-password?onboarding=true` 替代 `/set-password`

**关键逻辑：**
```typescript
// 登录成功后的导航逻辑
if (result.userType === 'new') {
  // 新用户进入onboarding流程
  navigate('/set-password?onboarding=true');
} else if (result.hasExistingWallets) {
  // 老用户直接进入首页
  navigate('/home');
} else {
  // 老用户无钱包，创建钱包
  navigate('/create-wallet');
}
```

### 3. 修改 SetPassword.tsx

**变更内容：**
- 检测URL参数 `onboarding=true` 判断是否为onboarding流程
- **onboarding流程中**：移除"稀后设置"按钮，密码设置为强制
- **非onboarding流程**：保持现有逻辑，允许跳过
- 成功后导航到 `/onboarding?new=true`

**关键代码改动：**
```typescript
const [searchParams] = useSearchParams();
const isOnboardingFlow = searchParams.get('onboarding') === 'true';

// 移除跳过按钮的条件渲染
{!isOnboardingFlow && (
  <button onClick={handleSkip}>
    稀后设置
  </button>
)}

// 返回按钮逻辑
const handleBack = () => {
  if (isOnboardingFlow) {
    // onboarding流程中不允许返回，或返回到登录页
    navigate('/login');
  } else {
    navigate(-1);
  }
};
```

### 4. 修改 Onboarding.tsx

**变更内容：**
- 确保流程完成后导航到 `/home`
- 添加流程完成状态标记
- 禁止在onboarding流程中返回到之前的步骤（第一步除外）

**关键改动：**
```typescript
const handleBack = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  } else if (isNewUser) {
    // 新用户在第一步时，返回会退出onboarding
    // 可以选择返回登录页或保持在当前步骤
    navigate('/login');
  } else {
    navigate('/home');
  }
};
```

### 5. 社交登录流程同步更新

**变更内容：**
- Apple/Google 登录成功后，新用户同样进入密码设置流程

```typescript
const handleSocialLogin = async (provider: 'apple' | 'google') => {
  // ... 登录逻辑
  if (result.userType === 'new') {
    navigate('/set-password?onboarding=true');
  } else if (result.hasExistingWallets) {
    navigate('/home');
  } else {
    navigate('/create-wallet');
  }
};
```

## 文件改动清单

| 文件 | 改动类型 | 改动说明 |
|------|----------|----------|
| `src/pages/Login.tsx` | 修改 | 更新新用户导航逻辑，添加 onboarding 参数 |
| `src/pages/SetPassword.tsx` | 修改 | 添加 onboarding 模式判断，条件性隐藏跳过按钮，更新返回逻辑 |
| `src/pages/Onboarding.tsx` | 修改 | 更新返回按钮逻辑，确保流程完整性 |

## 用户体验优化

1. **强制密码设置页面**：
   - 标题更改为"设置登录密码"，突出安全性
   - 移除"稀后设置"选项，仅保留主要操作按钮
   - 返回按钮行为：返回登录页（需重新登录）

2. **流程连贯性**：
   - 每个步骤明确显示进度
   - 用户无法跳过关键步骤
   - 完成后直接进入钱包首页

## 边界情况处理

1. **用户刷新页面**：通过 localStorage 或 sessionStorage 保存 onboarding 状态
2. **用户直接访问 URL**：验证用户是否已登录，未登录则重定向到登录页
3. **网络异常**：保持当前步骤状态，允许重试

## 实施顺序

1. 修改 `SetPassword.tsx` - 添加 onboarding 模式支持
2. 修改 `Login.tsx` - 更新导航逻辑
3. 修改 `Onboarding.tsx` - 更新返回逻辑
4. 测试完整流程
