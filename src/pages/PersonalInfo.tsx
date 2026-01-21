import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Check, Phone, Mail, Lock, ShieldCheck, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

// Password strength calculation
function getPasswordStrength(password: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string } {
  if (!password) return { level: 'weak', label: '', color: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  if (score <= 2) return { level: 'weak', label: '弱', color: 'bg-red-500' };
  if (score <= 3) return { level: 'medium', label: '中', color: 'bg-yellow-500' };
  return { level: 'strong', label: '强', color: 'bg-green-500' };
}

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { userInfo } = useWallet();
  
  const initialNickname = userInfo?.email?.split('@')[0] || '';
  const [nickname, setNickname] = useState(initialNickname);
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneBound, setIsPhoneBound] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const userId = 'UID-2024-XXXX-XXXX';
  
  // Calculate password strength
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  
  // Check if user has made any changes
  const hasChanges = useMemo(() => {
    return nickname !== initialNickname || password.length > 0;
  }, [nickname, initialNickname, password]);

  const handleSendCode = async () => {
    if (!phone || phone.length < 11) {
      toast.error('请输入正确的手机号');
      return;
    }
    
    setIsSendingCode(true);
    // Simulate sending code
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSendingCode(false);
    setShowVerification(true);
    toast.success('验证码已发送');
    
    // Start countdown
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyPhone = async () => {
    if (verificationCode.length !== 6) {
      toast.error('请输入6位验证码');
      return;
    }
    
    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsVerifying(false);
    setIsPhoneBound(true);
    setShowVerification(false);
    toast.success('手机号绑定成功');
  };
  
  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    toast.success('用户ID已复制');
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    if (password && passwordStrength.level === 'weak') {
      toast.error('密码强度太弱，请设置更安全的密码');
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('个人信息已更新');
    navigate(-1);
  };

  const maskedPhone = isPhoneBound && phone ? 
    phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';

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

        <div className="flex-1 px-4 pb-24 overflow-auto">
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
            {/* User ID - Now at top */}
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
                  <Copy className="w-4 h-4" />
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

            {/* Email (Read-only for OAuth) */}
            <div className="card-elevated p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  邮箱
                </label>
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent">
                  <Lock className="w-3 h-3 mr-1" />
                  OAuth 绑定
                </Badge>
              </div>
              <Input
                value={userInfo?.email || ''}
                readOnly
                className="bg-muted/30 border-0 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">通过第三方账号登录，邮箱不可修改</p>
            </div>

            {/* Phone Number */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  手机号
                </label>
                {isPhoneBound && (
                  <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    已验证
                  </Badge>
                )}
              </div>
              
              {isPhoneBound ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={maskedPhone}
                    readOnly
                    className="bg-muted/30 border-0 text-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPhoneBound(false);
                      setPhone('');
                      setVerificationCode('');
                    }}
                    className="shrink-0"
                  >
                    更换
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="请输入手机号"
                      type="tel"
                      className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendCode}
                      disabled={isSendingCode || countdown > 0 || phone.length < 11}
                      className="shrink-0 min-w-[88px]"
                    >
                      {isSendingCode ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
                        />
                      ) : countdown > 0 ? (
                        `${countdown}s`
                      ) : (
                        '获取验证码'
                      )}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showVerification && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="请输入6位验证码"
                            className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
                          />
                          <Button
                            onClick={handleVerifyPhone}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className="shrink-0 bg-accent hover:bg-accent/90"
                          >
                            {isVerifying ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                              />
                            ) : (
                              '验证'
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          验证码已发送至 {phone}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
              
              <p className="text-xs text-muted-foreground">
                绑定手机号可用于安全验证和找回账户
              </p>
            </div>

            {/* Password Setting */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  设置密码
                </label>
              </div>
              
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入新密码"
                className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                      <div 
                        className={`h-full rounded-full transition-all ${passwordStrength.level === 'weak' ? passwordStrength.color : 'bg-muted-foreground/20'} ${passwordStrength.level !== 'weak' ? passwordStrength.color : ''}`}
                        style={{ width: '33%' }}
                      />
                      <div 
                        className={`h-full rounded-full transition-all ${passwordStrength.level === 'medium' || passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-muted-foreground/20'}`}
                        style={{ width: '33%' }}
                      />
                      <div 
                        className={`h-full rounded-full transition-all ${passwordStrength.level === 'strong' ? passwordStrength.color : 'bg-muted-foreground/20'}`}
                        style={{ width: '33%' }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak' ? 'text-red-500' : 
                      passwordStrength.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    建议使用8位以上，包含大小写字母、数字和特殊字符
                  </p>
                </motion.div>
              )}
              
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请确认新密码"
                className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent"
              />
              
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">两次输入的密码不一致</p>
              )}
              
              <p className="text-xs text-muted-foreground">
                设置密码后可用于登录和安全验证
              </p>
            </div>
          </motion.div>
        </div>

        {/* Save Button - Fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent"
        >
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
