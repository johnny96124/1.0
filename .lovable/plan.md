# 品牌设计与UI规范优化方案 ✅ 已完成

## 实施状态: 完成 ✅

所有需求已实施完成，包括：

### 已完成的修改

1. **品牌颜色系统更新** ✅
   - `--primary`: 更新为品牌蓝色 `233 75% 48%` (#1F32D6)
   - `--foreground`: 更新为品牌黑色 `0 0% 11%` (#1C1C1C)
   - `--border` & `--input`: 更新为品牌描边色 `228 18% 94%` (#EDEEF3)

2. **服务条款和隐私政策链接** ✅
   - 移除多余空格
   - 链接颜色改为品牌蓝色
   - 添加 onClick 跳转到 /terms 和 /privacy

3. **启动页(Splash Screen)更新** ✅
   - 复制COBO官方Logo到 `src/assets/cobo-logo.svg`
   - 替换启动页Logo为COBO官方Logo
   - 保持脉冲环动画效果
   - 更新底部"Powered by"显示为Logo图标

4. **Welcome和Login页面视觉统一** ✅
   - 统一为 blue/violet/emerald 三色主题
   - 更新所有动画背景orb颜色
   - 更新浮动图标背景色
   - 更新脉冲动画颜色

5. **按钮和输入框尺寸调整** ✅
   - 所有主按钮: 56px → 48px (h-14 → h-12)
   - 所有输入框: 56px → 48px (h-14 → h-12)
   - OAuth按钮: 56px → 48px (h-14 → h-12)
   - Google/Apple Logo: 保持 20x20px 不变

6. **按钮悬停行为规范** ✅
   - Primary按钮悬停变深蓝色 (hover:bg-primary/90)
   - Outline按钮悬停保持灰色 (hover:bg-muted hover:text-foreground)

## 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `src/assets/cobo-logo.svg` | 新建 - COBO官方Logo |
| `src/index.css` | 更新品牌颜色变量 |
| `src/components/ui/button.tsx` | 更新outline按钮悬停效果 |
| `src/pages/Splash.tsx` | 替换Logo为COBO官方Logo |
| `src/pages/Login.tsx` | 修复T&Cs链接、调整高度 |
| `src/pages/SetPassword.tsx` | 调整按钮/输入框高度 |
| `src/pages/Welcome.tsx` | 统一颜色主题 |
