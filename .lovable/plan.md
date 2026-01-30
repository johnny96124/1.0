
# 隐藏底部导航栏 - 账户设置子页面修改计划

## 问题分析

从截图中可以看到，账户设置页面（/profile）显示底部导航栏是正确的，因为它是主导航入口之一。但当用户点击进入任何子功能页面时，应该隐藏底部导航栏，让用户专注于当前功能。

根据 `AppLayout` 组件的设计，`showNav` 默认值为 `true`，因此未显式设置 `showNav={false}` 的页面会默认显示导航栏。

---

## 当前状态检查结果

### 已正确设置 `showNav={false}` 的页面

| 页面 | 路由 | 状态 |
|------|------|------|
| PersonalInfo | /profile/info | 已设置 |
| WalletManagement | /profile/wallets | 已设置 |

### 需要添加 `showNav={false}` 的页面

以下页面从 Profile 页面导航进入，但未设置 `showNav={false}`：

| 页面 | 路由 | 当前设置 | 问题 |
|------|------|----------|------|
| Security | /profile/security | 无 showNav | 显示导航栏 |
| DeviceManagement | /profile/devices | 无 showNav | 显示导航栏 |
| Contacts | /profile/contacts | 无 showNav | 显示导航栏 |
| ContactDetail | /profile/contacts/:id | 无 showNav | 显示导航栏 |
| ContactForm | /profile/contacts/add, /profile/contacts/edit/:id | 无 showNav | 显示导航栏 |
| Notifications | /profile/notifications | 无 showNav | 显示导航栏 |
| Help | /profile/help | 无 showNav | 显示导航栏 |
| TSSBackupManagement | /profile/security/tss-backup | 未使用 AppLayout | 无导航栏（正确） |
| PSPCenter | /psp | 无 showNav | 显示导航栏 |
| PSPDetail | /psp/:id | 无 showNav | 显示导航栏 |
| PSPConnect | /psp/connect | 无 showNav | 显示导航栏 |
| PSPPermissions | /psp/:id/permissions | 无 showNav | 显示导航栏 |
| Receive | /receive | 无 showNav | 显示导航栏 |

---

## 修改计划

### 1. Security.tsx
**行 89**
```tsx
// 改前
<AppLayout title="安全与风控" showBack>

// 改后  
<AppLayout showNav={false} title="安全与风控" showBack>
```

### 2. DeviceManagement.tsx
**行 134**
```tsx
// 改前
<AppLayout title="登录历史" showBack>

// 改后
<AppLayout showNav={false} title="登录历史" showBack>
```

### 3. Contacts.tsx
**行 42-45**
```tsx
// 改前
<AppLayout
  title="地址簿"
  showBack

// 改后
<AppLayout
  showNav={false}
  title="地址簿"
  showBack
```

### 4. ContactDetail.tsx
**行 45** 和 **行 85-88**
```tsx
// 改前（两处）
<AppLayout title="联系人详情" showBack ...

// 改后
<AppLayout showNav={false} title="联系人详情" showBack ...
```

### 5. ContactForm.tsx
**行 136-139**
```tsx
// 改前
<AppLayout
  title={isEditing ? '编辑联系人' : '添加联系人'}
  showBack

// 改后
<AppLayout
  showNav={false}
  title={isEditing ? '编辑联系人' : '添加联系人'}
  showBack
```

### 6. Notifications.tsx
**行 68**
```tsx
// 改前
<AppLayout title="通知设置" showBack>

// 改后
<AppLayout showNav={false} title="通知设置" showBack>
```

### 7. Help.tsx
**行 125**
```tsx
// 改前
<AppLayout title="帮助与支持" showBack>

// 改后
<AppLayout showNav={false} title="帮助与支持" showBack>
```

### 8. PSPCenter.tsx
**行 357-360**
```tsx
// 改前
<AppLayout 
  title="服务商管理" 
  showBack 
  onBack={() => navigate(-1)}

// 改后
<AppLayout 
  showNav={false}
  title="服务商管理" 
  showBack 
  onBack={() => navigate(-1)}
```

### 9. PSPDetail.tsx
**行 52** 和 **行 116-119**
```tsx
// 改前（两处）
<AppLayout title="服务商详情" showBack ...

// 改后
<AppLayout showNav={false} title="服务商详情" showBack ...
```

### 10. PSPConnect.tsx
**行 662-665**
```tsx
// 改前
<AppLayout 
  title={getTitle()}
  showBack={currentStep !== 'submitted'}
  onBack={handleBack}

// 改后
<AppLayout 
  showNav={false}
  title={getTitle()}
  showBack={currentStep !== 'submitted'}
  onBack={handleBack}
```

### 11. PSPPermissions.tsx
**行 77** 和 **行 103-106**
```tsx
// 改前（两处）
<AppLayout title="权限管理" showBack ...

// 改后
<AppLayout showNav={false} title="权限管理" showBack ...
```

### 12. Receive.tsx
**行 205**
```tsx
// 改前
<AppLayout showBack title="收款" onBack={handleBack}>

// 改后
<AppLayout showNav={false} showBack title="收款" onBack={handleBack}>
```

---

## 文件变更汇总

| 文件 | 修改位置数 | 描述 |
|------|-----------|------|
| `src/pages/Security.tsx` | 1 | 添加 showNav={false} |
| `src/pages/DeviceManagement.tsx` | 1 | 添加 showNav={false} |
| `src/pages/Contacts.tsx` | 1 | 添加 showNav={false} |
| `src/pages/ContactDetail.tsx` | 2 | 添加 showNav={false}（两处 AppLayout） |
| `src/pages/ContactForm.tsx` | 1 | 添加 showNav={false} |
| `src/pages/Notifications.tsx` | 1 | 添加 showNav={false} |
| `src/pages/Help.tsx` | 1 | 添加 showNav={false} |
| `src/pages/PSPCenter.tsx` | 1 | 添加 showNav={false} |
| `src/pages/PSPDetail.tsx` | 2 | 添加 showNav={false}（两处 AppLayout） |
| `src/pages/PSPConnect.tsx` | 1 | 添加 showNav={false} |
| `src/pages/PSPPermissions.tsx` | 2 | 添加 showNav={false}（两处 AppLayout） |
| `src/pages/Receive.tsx` | 1 | 添加 showNav={false} |

共 **12 个文件**，**15 处修改**

---

## 说明

- **主页面**（Home, History, Profile）应保留底部导航栏
- **所有子页面**进入后应隐藏导航栏，用户通过返回按钮导航
- 这符合移动端应用的标准导航模式
