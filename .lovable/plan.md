

## 应用后台锁屏保护功能

### 功能概述
当钱包应用切换到后台一段时间后再次唤起时，需要：
1. **隐藏屏幕内容** - 保护敏感的资产和交易信息
2. **显示锁屏界面** - 居中显示一个大图标
3. **用户点击验证** - 点击图标后进行身份验证（生物识别/密码）
4. **验证通过后恢复** - 解锁后恢复正常页面展示

---

### 实现方案

#### 1. 创建 App Lock Context（应用锁状态管理）

**新建文件：** `src/contexts/AppLockContext.tsx`

负责管理应用锁定状态：
- 锁定状态（`locked` / `unlocked`）
- 后台时间戳记录
- 锁定超时配置（默认30秒可配置）
- 监听页面可见性变化（`visibilitychange` 事件）
- 提供解锁方法

```text
┌─────────────────────────────────────────────────┐
│              AppLockContext                      │
├─────────────────────────────────────────────────┤
│  State:                                          │
│  - isLocked: boolean                             │
│  - backgroundTimestamp: Date | null              │
│  - lockTimeout: number (seconds)                 │
│                                                  │
│  Methods:                                        │
│  - unlock(): void                                │
│  - setLockTimeout(seconds): void                 │
│                                                  │
│  Auto-lock Logic:                                │
│  - visibilitychange → hidden: record timestamp  │
│  - visibilitychange → visible: check duration   │
│  - if duration > lockTimeout → lock             │
└─────────────────────────────────────────────────┘
```

#### 2. 创建锁屏覆盖组件

**新建文件：** `src/components/AppLockScreen.tsx`

全屏覆盖层组件：
- 模糊背景（隐藏底层内容）
- 居中显示大图标（锁头或钱包图标）
- 点击图标触发验证
- 验证方式：
  - 优先使用生物识别（如果已启用）
  - 退回到密码验证
- 平滑的解锁动画

```text
┌─────────────────────────────────────────────────┐
│                 Lock Screen                      │
│                                                  │
│          ┌──────────────────────┐               │
│          │                      │               │
│          │    ┌──────────┐      │               │
│          │    │   🔒     │      │  ← 大图标     │
│          │    │  点击解锁 │      │               │
│          │    └──────────┘      │               │
│          │                      │               │
│          │   商户钱包           │               │
│          │   点击图标解锁       │               │
│          │                      │               │
│          └──────────────────────┘               │
│                                                  │
│         Blurred Background Layer                 │
└─────────────────────────────────────────────────┘
```

#### 3. 修改应用入口集成锁屏

**修改文件：** `src/App.tsx`

- 在 `PhoneFrame` 内部添加 `AppLockProvider`
- 在应用顶层渲染 `AppLockScreen` 组件（仅在锁定状态显示）
- 确保锁屏层级高于所有其他内容

#### 4. 创建解锁验证抽屉

**新建文件：** `src/components/UnlockDrawer.tsx`

验证抽屉组件：
- 支持密码输入验证
- 支持生物识别验证（模拟）
- 验证失败显示错误提示
- 验证成功后调用解锁方法

---

### 技术细节

#### 页面可见性检测
```text
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 记录进入后台时间
    setBackgroundTimestamp(new Date());
  } else {
    // 检查后台时长
    if (超过锁定时间) {
      setIsLocked(true);
    }
  }
});
```

#### 锁屏样式
- 使用 `position: fixed` 覆盖整个视口
- `backdrop-filter: blur(20px)` 模糊背景
- `z-index` 高于所有其他元素
- 使用 Framer Motion 实现平滑过渡动画

#### 安全考虑
- 锁屏状态存储在内存中（不持久化）
- 页面刷新时重新登录
- 可在安全设置中配置锁定时长

---

### 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/contexts/AppLockContext.tsx` | 应用锁状态管理 Context |
| 新建 | `src/components/AppLockScreen.tsx` | 锁屏覆盖界面组件 |
| 新建 | `src/components/UnlockDrawer.tsx` | 解锁验证抽屉组件 |
| 修改 | `src/App.tsx` | 集成 AppLockProvider 和 AppLockScreen |
| 修改 | `src/pages/Security.tsx` | 添加锁定超时配置选项（可选） |

---

### 用户流程

```text
用户正常使用 App
      │
      ▼
App 切换到后台
      │
      ▼
记录后台时间戳
      │
      ▼
用户回到 App
      │
      ├─── 后台时间 < 30秒 ───► 正常显示
      │
      └─── 后台时间 ≥ 30秒 ───► 显示锁屏
                                    │
                                    ▼
                            点击中央图标
                                    │
                                    ▼
                            弹出验证抽屉
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   生物识别验证            密码验证
                        │                       │
                        ▼                       ▼
                   验证成功/失败          验证成功/失败
                        │                       │
                        └───────────┬───────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                     成功                    失败
                        │                       │
                        ▼                       ▼
                   解锁，恢复页面          显示错误提示
```

---

### 界面设计要点

锁屏界面参考现有 Splash 页面风格：
- 居中的大图标（锁头图标，`w-24 h-24`）
- 图标容器带有呼吸动画效果
- 下方显示 "点击解锁" 提示文字
- 底部保留 "Powered by COBO" 标识
- 支持深色/浅色主题

