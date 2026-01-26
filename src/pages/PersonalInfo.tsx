import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Mail, Lock, Copy, Check, Edit3, Phone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { BindAccountDrawer } from '@/components/BindAccountDrawer';
import { ChangePasswordDrawer } from '@/components/ChangePasswordDrawer';

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { userInfo } = useWallet();
  
  const initialNickname = userInfo?.email?.split('@')[0] || '';
  const [nickname, setNickname] = useState(initialNickname);
  
  // Bound accounts
  const [boundEmail, setBoundEmail] = useState<string | null>(userInfo?.email || null);
  const [boundPhone, setBoundPhone] = useState<string | null>(null);
  
  // Bind drawer state
  const [bindDrawerOpen, setBindDrawerOpen] = useState(false);
  const [bindType, setBindType] = useState<'email' | 'phone'>('email');
  const [bindMode, setBindMode] = useState<'bind' | 'rebind'>('bind');
  const [currentBindValue, setCurrentBindValue] = useState<string>('');
  
  // Password drawer state
  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  
  // Copy state
  const [copied, setCopied] = useState(false);
  
  const userId = 'UID-2024-XXXX-XXXX';
  
  // Check if password exists on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('user_password');
    if (savedPassword) {
      setHasExistingPassword(true);
    }
    // Load bound phone from localStorage
    const savedPhone = localStorage.getItem('bound_phone');
    if (savedPhone) {
      setBoundPhone(savedPhone);
    }
  }, []);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success('已复制到剪贴板', {
      description: '用户ID已复制',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBindAccount = (type: 'email' | 'phone') => {
    const isBound = type === 'email' ? boundEmail : boundPhone;
    setBindType(type);
    setBindMode(isBound ? 'rebind' : 'bind');
    setCurrentBindValue(isBound || '');
    setBindDrawerOpen(true);
  };

  const handleBindSuccess = (value: string) => {
    if (bindType === 'email') {
      setBoundEmail(value);
      toast.success('邮箱绑定成功');
    } else {
      setBoundPhone(value);
      localStorage.setItem('bound_phone', value);
      toast.success('手机号绑定成功');
    }
  };

  const handlePasswordSuccess = () => {
    setHasExistingPassword(true);
    toast.success('密码设置成功');
  };

  // Mask phone number for display
  const maskPhone = (phone: string) => {
    if (!phone) return '';
    const parts = phone.split(' ');
    if (parts.length < 2) return phone;
    const countryCode = parts[0];
    const number = parts.slice(1).join('');
    if (number.length <= 4) return phone;
    return `${countryCode} ${number.slice(0, 3)}****${number.slice(-4)}`;
  };

  // Mask email for display
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain || local.length <= 2) return email;
    return `${local.slice(0, 2)}****@${domain}`;
  };

  return (
    <AppLayout showNav={false}>
      <div className="min-h-full flex flex-col">
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

        <div className="flex-1 px-4 pb-8 overflow-auto">
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
            {/* User ID */}
            <div className="card-elevated p-4 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">用户 ID</label>
              <div className="flex items-center gap-2">
                <Input
                  value={userId}
                  readOnly
                  className="bg-muted/30 border-0 text-muted-foreground cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUserId}
                  className="shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">用于客服查询，不可修改</p>
            </div>

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

            {/* Phone Binding Card */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  手机号
                </label>
                {boundPhone && (
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    已绑定
                  </Badge>
                )}
              </div>
              
              {boundPhone ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center h-10 px-3 rounded-md bg-muted/30">
                    <span className="text-muted-foreground">{maskPhone(boundPhone)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBindAccount('phone')}
                    className="shrink-0 gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    换绑
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleBindAccount('phone')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  绑定手机号
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                用于登录和安全验证
              </p>
            </div>

            {/* Email Binding Card */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  邮箱
                </label>
                {boundEmail && (
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    已绑定
                  </Badge>
                )}
              </div>
              
              {boundEmail ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center h-10 px-3 rounded-md bg-muted/30">
                    <span className="text-muted-foreground">{maskEmail(boundEmail)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBindAccount('email')}
                    className="shrink-0 gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    换绑
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleBindAccount('email')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  绑定邮箱
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                用于登录和找回密码
              </p>
            </div>

            {/* Password Setting Card */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  登录密码
                </label>
                {hasExistingPassword && (
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    已设置
                  </Badge>
                )}
              </div>
              
              {hasExistingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center h-10 px-3 rounded-md bg-muted/30">
                    <span className="text-muted-foreground">••••••••</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordDrawerOpen(true)}
                    className="shrink-0 gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    修改
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPasswordDrawerOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  设置登录密码
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                密码可用于登录和安全验证
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bind Account Drawer */}
      <BindAccountDrawer
        open={bindDrawerOpen}
        onOpenChange={setBindDrawerOpen}
        type={bindType}
        mode={bindMode}
        currentValue={currentBindValue}
        onSuccess={handleBindSuccess}
      />

      {/* Change Password Drawer */}
      <ChangePasswordDrawer
        open={passwordDrawerOpen}
        onOpenChange={setPasswordDrawerOpen}
        hasExistingPassword={hasExistingPassword}
        onSuccess={handlePasswordSuccess}
        boundEmail={boundEmail}
        boundPhone={boundPhone}
      />
    </AppLayout>
  );
}
