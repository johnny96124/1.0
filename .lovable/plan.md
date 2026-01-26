

# 品牌设计与UI规范优化方案

## 需求概述

根据用户提供的6个需求点，加上新增的按钮悬停行为规范，需要对应用进行全局性的品牌设计优化，涉及颜色系统、尺寸规范、启动页面、多个页面的视觉统一性以及按钮交互行为。

---

## 实现方案

### 1. 品牌颜色系统更新

**涉及文件**: `src/index.css`

**品牌颜色规范**:
| 用途 | HEX | HSL |
|------|-----|-----|
| 品牌蓝 (Primary) | #1F32D6 | 233 75% 48% |
| 品牌黑 (Foreground) | #1C1C1C | 0 0% 11% |
| 品牌白 (Background) | #FFFFFF | 0 0% 100% |
| 描边/边框 (Border) | #EDEEF3 | 228 18% 94% |

**需要修改的CSS变量**:
- `--primary`: 更新为品牌蓝色 `233 75% 48%`
- `--foreground`: 更新为品牌黑色 `0 0% 11%`
- `--border`: 更新为品牌描边色 `228 18% 94%`
- `--input`: 更新为品牌描边色 `228 18% 94%`
- 同步更新 `--gradient-primary` 和相关阴影变量

---

### 2. 服务条款和隐私政策链接优化

**涉及文件**: `src/pages/Login.tsx`

**当前问题** (第980-985行):
```tsx
继续即表示您同意我们的
<button className="text-primary ml-1">服务条款</button>
和
<button className="text-primary ml-1">隐私政策</button>
```

**修复内容**:
- 移除 `ml-1` 导致的多余空格
- 将链接颜色改为品牌蓝色 `#1F32D6`
- 添加 `onClick` 事件跳转到 `/terms` 和 `/privacy` 页面
- 添加 `hover:underline` 效果增强可点击感

---

### 3. 启动页(Splash Screen)更新

**涉及文件**: 
- `src/assets/cobo-logo.svg` (新建)
- `src/pages/Splash.tsx`

**修改内容**:
- 将用户上传的COBO蓝色Logo保存到项目资源目录
- 替换当前的盾牌/六边形SVG为官方COBO Logo
- 保持现有的脉冲环动画效果
- 更新底部"Powered by COBO"区域显示Logo图标

---

### 4. Welcome和Login页面视觉统一

**涉及文件**: `src/pages/Welcome.tsx`, `src/pages/Login.tsx`

**当前问题**:
- Welcome页面使用 `primary/emerald/amber` 三色主题
- Login页面使用 `blue/violet/emerald` 三色主题
- 颜色方案不一致

**解决方案**:
统一使用 `blue (品牌蓝)/violet/emerald` 三色主题:

| 幻灯片 | 颜色主题 |
|--------|----------|
| 第1张 | 品牌蓝 (blue/cyan) |
| 第2张 | 紫色 (violet/purple) |
| 第3张 | 翠绿色 (emerald/teal) |

**Welcome.tsx 修改点**:
- 更新 slides 数组中的 `iconBg` 渐变色
- 更新动画背景orb的颜色类
- 更新浮动图标的背景色
- 更新脉冲动画的颜色

---

### 5. 按钮和输入框尺寸调整

**涉及文件**: 多个页面

**尺寸规范**:
| 元素 | 当前高度 | 目标高度 |
|------|----------|----------|
| 主按钮 | 56px (h-14) | 48px (h-12) |
| 输入框 | 56px (h-14) | 48px (h-12) |
| OAuth按钮 | 56px (h-14) | 48px (h-12) |
| Google/Apple Logo | 20x20px (w-5 h-5) | 保持不变 |

**需要修改的文件**:
- `src/pages/Login.tsx`: 密码输入框、继续按钮、社交登录按钮
- `src/pages/SetPassword.tsx`: 密码输入框、设置密码按钮
- `src/pages/Welcome.tsx`: 注册/登录按钮 (已经是 h-12，无需修改)

---

### 6. 按钮悬停行为规范 (新增需求)

**涉及文件**: `src/components/ui/button.tsx`

**悬停行为规范**:
| 按钮类型 | 悬停效果 |
|----------|----------|
| Primary (default) | 悬停时变为品牌蓝色的深色调 (hover:bg-primary/90) |
| Secondary/Outline | 悬停时保持灰色调，不变蓝 |

**当前问题**:
```tsx
// button.tsx 第14行
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
```
- `outline` 按钮悬停时会变为 `accent` 色（蓝色）
- 需要改为灰色悬停效果

**解决方案**:
- 将 `outline` 变体的悬停效果从 `hover:bg-accent` 改为 `hover:bg-muted`
- 将 `hover:text-accent-foreground` 改为 `hover:text-foreground`
- 这样 Google/Apple 登录按钮在悬停时会保持灰色

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/assets/cobo-logo.svg` | 新建 | 保存用户上传的COBO官方Logo |
| `src/index.css` | 修改 | 更新品牌颜色变量 (primary, foreground, border) |
| `src/components/ui/button.tsx` | 修改 | 更新outline按钮的悬停效果为灰色 |
| `src/pages/Splash.tsx` | 修改 | 替换Logo为COBO官方Logo |
| `src/pages/Login.tsx` | 修改 | 修复T&Cs链接、调整按钮/输入框高度 |
| `src/pages/SetPassword.tsx` | 修改 | 调整按钮/输入框高度 |
| `src/pages/Welcome.tsx` | 修改 | 统一颜色主题为blue/violet/emerald |

---

## 技术实现细节

### index.css 颜色变量修改

```css
:root {
  /* 品牌蓝色 - #1F32D6 */
  --primary: 233 75% 48%;
  --primary-foreground: 0 0% 100%;
  
  /* 品牌黑色 - #1C1C1C */
  --foreground: 0 0% 11%;
  
  /* 品牌描边色 - #EDEEF3 */
  --border: 228 18% 94%;
  --input: 228 18% 94%;
  
  /* 更新渐变变量 */
  --gradient-primary: linear-gradient(135deg, hsl(233 75% 48%) 0%, hsl(233 75% 38%) 100%);
}
```

### button.tsx 悬停行为修改

```tsx
// 修改前
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",

// 修改后
outline: "border border-input bg-background hover:bg-muted hover:text-foreground",
```

### Login.tsx T&Cs 链接修复

```tsx
// 修改前 (第980-985行)
<p className="text-xs text-center text-muted-foreground">
  继续即表示您同意我们的
  <button className="text-primary ml-1">服务条款</button>
  和
  <button className="text-primary ml-1">隐私政策</button>
</p>

// 修改后
<p className="text-xs text-center text-muted-foreground">
  继续即表示您同意我们的<button 
    className="hover:underline"
    style={{ color: '#1F32D6' }}
    onClick={() => navigate('/terms')}
  >服务条款</button>和<button 
    className="hover:underline"
    style={{ color: '#1F32D6' }}
    onClick={() => navigate('/privacy')}
  >隐私政策</button>
</p>
```

### Welcome.tsx 颜色主题统一

```tsx
// 统一为 blue/violet/emerald 三色主题
const slides: SlideData[] = [
  {
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400', // 蓝色
    // ...
  },
  {
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-400', // 紫色
    // ...
  },
  {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400', // 翠绿
    // ...
  },
];
```

### 高度调整示例

```tsx
// 修改前
<Button className="w-full h-14 text-base font-medium">
<Input className="h-14 text-base" />

// 修改后
<Button className="w-full h-12 text-base font-medium">
<Input className="h-12 text-base" />
```

---

## 视觉效果预期

1. **颜色一致性**: 所有主要按钮、链接、强调元素统一使用品牌蓝色 `#1F32D6`
2. **启动页**: 显示COBO官方Logo并保持流畅的脉冲环动画
3. **页面统一**: Welcome和Login页面使用相同的蓝/紫/绿三色轮播主题
4. **尺寸规范**: 按钮和输入框统一为48px高度，界面更加紧凑
5. **交互优化**: 
   - 服务条款和隐私政策可点击跳转
   - Primary按钮悬停变深蓝色
   - Outline按钮 (如Google/Apple) 悬停保持灰色

