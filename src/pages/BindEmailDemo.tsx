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
