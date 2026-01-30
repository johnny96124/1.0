

# 锁屏演示页面分屏动画修复计划

## 问题分析

当前 `LockScreenDemo.tsx` 页面在用户点击解锁后，只是简单地关闭抽屉，没有实现预期的"向两边展开"动画效果。而 `AppLockScreen.tsx` 已经实现了完整的分屏滑动动画。

## 解决方案

将 `AppLockScreen.tsx` 中的分屏动画逻辑移植到 `LockScreenDemo.tsx`，包括：

1. 添加 `isUnlocking` 状态来控制动画
2. 将背景改为左右两个独立面板
3. 解锁时触发左右面板分别向两侧滑出
4. 中心内容同步淡出并缩小
5. 动画完成后导航到首页（或重置状态）

## 实现步骤

### 步骤 1：添加动画状态和导航

```typescript
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const [isUnlocking, setIsUnlocking] = useState(false);
const navigate = useNavigate();
```

### 步骤 2：修改解锁处理函数

```typescript
const handleUnlock = () => {
  setIsUnlocking(true);
  setShowUnlockDrawer(false);
  
  // 等待动画完成后跳转
  setTimeout(() => {
    navigate('/home');
  }, 600);
};
```

### 步骤 3：重构页面布局为分屏结构

将当前的单一背景改为左右两个面板：

- **左面板**：占据左半屏，解锁时向左滑出 (`x: '-100%'`)
- **右面板**：占据右半屏，解锁时向右滑出 (`x: '100%'`)
- **中心内容**：解锁时淡出并缩小 (`opacity: 0, scale: 0.8`)

### 步骤 4：动画配置

```typescript
transition={{ 
  duration: 0.5, 
  ease: [0.32, 0.72, 0, 1]  // 自定义缓动曲线
}}
```

## 技术细节

| 元素 | 初始状态 | 解锁时 | 动画时长 |
|------|----------|--------|----------|
| 左面板 | `x: 0` | `x: '-100%'` | 500ms |
| 右面板 | `x: 0` | `x: '100%'` | 500ms |
| 中心内容 | `opacity: 1, scale: 1` | `opacity: 0, scale: 0.8` | 300ms |

## 修改文件

- `src/pages/LockScreenDemo.tsx` - 添加分屏动画逻辑

