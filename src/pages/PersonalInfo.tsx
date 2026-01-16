import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { userInfo } = useWallet();
  
  const [nickname, setNickname] = useState(userInfo?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('个人信息已更新');
    navigate(-1);
  };

  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen flex flex-col">
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
          <h1 className="text-xl font-bold text-foreground">个人信息</h1>
        </motion.div>

        <div className="flex-1 px-4 pb-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center py-6"
          >
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userInfo?.avatar} alt="User avatar" />
                <AvatarFallback className="bg-accent/20 text-accent text-2xl font-semibold">
                  {nickname[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">点击更换头像</p>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Nickname */}
            <div className="card-elevated p-4 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">昵称</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
              />
            </div>

            {/* Email */}
            <div className="card-elevated p-4 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">邮箱</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                type="email"
                className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
              />
              <p className="text-xs text-muted-foreground">用于接收重要通知和找回账户</p>
            </div>

            {/* User ID (Read-only) */}
            <div className="card-elevated p-4 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">用户 ID</label>
              <div className="flex items-center gap-2">
                <Input
                  value="UID-2024-XXXX-XXXX"
                  readOnly
                  className="bg-muted/30 border-0 text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">用于客服查询，不可修改</p>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-6"
        >
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                />
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                保存修改
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
