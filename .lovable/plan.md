
# 绑定邮箱演示页面方案

## 需求概述

创建一个新的演示页面，展示绑定邮箱的完整流程，方便用户体验和测试邮箱绑定功能。

---

## 实现方案

### 新建演示页面

**新建文件**: `src/pages/BindEmailDemo.tsx`

**页面功能**:
- 提供一个简洁的演示入口页面
- 点击按钮后打开绑定邮箱的 Drawer
- 完整展示三步流程：输入邮箱 → 验证码验证 → 绑定成功
- 绑定成功后在页面上显示已绑定的邮箱

**页面结构**:
```
┌─────────────────────────┐
│  ← 绑定邮箱演示         │  Header
├─────────────────────────┤
│                         │
│       [邮件图标]        │
│                         │
│    点击下方按钮体验      │
│    邮箱绑定完整流程      │
│                         │
│   已绑定: user@xx.com   │  (绑定成功后显示)
│                         │
│   [  开始绑定邮箱  ]    │  主按钮
│                         │
└─────────────────────────┘
```

### 添加路由

**修改文件**: `src/App.tsx`

- 导入新页面组件
- 添加路由 `/bind-email-demo`

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pages/BindEmailDemo.tsx` | 新建 | 绑定邮箱演示页面 |
| `src/App.tsx` | 修改 | 添加演示页面路由 |

---

## 技术实现细节

### BindEmailDemo.tsx 页面代码

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { BindAccountDrawer } from '@/components/BindAccountDrawer';

export default function BindEmailDemo() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [boundEmail, setBoundEmail] = useState<string | null>(null);

  const handleBindSuccess = (email: string) => {
    setBoundEmail(email);
  };

  const handleReset = () => {
    setBoundEmail(null);
  };

  return (
    <AppLayout showNav={false}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">绑定邮箱演示</h1>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <Mail className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {boundEmail ? '邮箱已绑定' : '邮箱绑定流程演示'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {boundEmail 
              ? '您已成功完成邮箱绑定流程'
              : '点击下方按钮体验完整的邮箱绑定流程'
            }
          </p>
        </motion.div>

        {/* Bound Email Display */}
        {boundEmail && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mb-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">已绑定邮箱</p>
                <p className="font-medium text-foreground truncate">{boundEmail}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            className="w-full h-12"
            onClick={() => setDrawerOpen(true)}
          >
            <Mail className="w-5 h-5 mr-2" />
            {boundEmail ? '重新绑定邮箱' : '开始绑定邮箱'}
          </Button>
          
          {boundEmail && (
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={handleReset}
            >
              重置演示
            </Button>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-muted/50 w-full max-w-sm"
        >
          <p className="text-xs text-muted-foreground text-center">
            提示：演示模式下，任意6位数字验证码均可通过验证
          </p>
        </motion.div>
      </div>

      {/* Bind Email Drawer */}
      <BindAccountDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        type="email"
        onSuccess={handleBindSuccess}
      />
    </AppLayout>
  );
}
```

### App.tsx 路由添加

```tsx
// 导入新页面
import BindEmailDemo from "./pages/BindEmailDemo";

// 在 Routes 中添加
<Route path="/bind-email-demo" element={<BindEmailDemo />} />
```

---

## 使用方式

页面创建完成后，可以通过以下方式访问：
- 直接访问 URL：`/bind-email-demo`
- 或在浏览器地址栏输入完整路径

---

## 流程预览

1. **进入演示页面** → 显示邮箱图标和"开始绑定邮箱"按钮
2. **点击按钮** → 弹出绑定邮箱 Drawer
3. **输入邮箱** → 如 `test@example.com`
4. **点击发送验证码** → 切换到验证码输入界面
5. **输入6位验证码** → 任意数字即可
6. **验证成功** → 显示成功动画，Drawer 关闭
7. **返回演示页面** → 显示已绑定的邮箱地址
