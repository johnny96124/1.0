import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Check, Phone, Mail, Lock, ShieldCheck, Copy, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { userInfo } = useWallet();
  
  const [nickname, setNickname] = useState(userInfo?.email?.split('@')[0] || '');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneBound, setIsPhoneBound] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Password management state
  const [isOAuthUser] = useState(true); // Mock: assume OAuth user by default
  const [hasPassword, setHasPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const userId = 'UID-2024-XXXX-XXXX';

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    toast.success('用户 ID 已复制');
  };

  const handleSendCode = async () => {
    if (!phone || phone.length < 11) {
      toast.error('请输入正确的手机号');
      return;
    }
    
    setIsSendingCode(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSendingCode(false);
    setShowVerification(true);
    toast.success('验证码已发送');
    
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsVerifying(false);
    setIsPhoneBound(true);
    setShowVerification(false);
    toast.success('手机号绑定成功');
  };

  const handleSetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('密码至少需要8位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    if (hasPassword && !currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    
    setIsSettingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSettingPassword(false);
    setHasPassword(true);
    setShowPasswordSection(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success(hasPassword ? '密码修改成功' : '密码设置成功');
  };

  const handleSave = async () => {
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
          {/* User ID at Top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-elevated p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-muted-foreground">用户 ID</label>
                <p className="text-sm font-mono text-foreground mt-1">{userId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUserId}
                className="h-8 px-3 text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">用于客服查询，不可修改</p>
          </motion.div>

          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userInfo?.avatar} alt="User avatar" />
                <AvatarFallback className="bg-accent/20 text-accent text-xl font-semibold">
                  {nickname[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">点击更换头像</p>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            {/* Nickname */}
            <div className="card-elevated p-4 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">昵称</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10"
              />
            </div>

            {/* Email (Read-only for OAuth) */}
            <div className="card-elevated p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  邮箱
                </label>
                <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  OAuth 绑定
                </Badge>
              </div>
              <Input
                value={userInfo?.email || ''}
                readOnly
                className="bg-muted/30 border-0 text-muted-foreground cursor-not-allowed h-10"
              />
              <p className="text-xs text-muted-foreground">通过第三方账号登录，邮箱不可修改</p>
            </div>

            {/* Password Section */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  登录密码
                </label>
                {hasPassword ? (
                  <Badge className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                    已设置
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5">
                    未设置
                  </Badge>
                )}
              </div>
              
              {!showPasswordSection ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full h-9"
                >
                  {hasPassword ? '修改密码' : '设置密码'}
                </Button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {hasPassword && (
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="当前密码"
                          className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                    
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={hasPassword ? '新密码（至少8位）' : '设置密码（至少8位）'}
                        className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="确认密码"
                        className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="flex-1 h-9"
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSetPassword}
                        disabled={isSettingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                        className="flex-1 h-9 bg-accent hover:bg-accent/90"
                      >
                        {isSettingPassword ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                          />
                        ) : (
                          '确认'
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
              
              <p className="text-xs text-muted-foreground">
                {isOAuthUser && !hasPassword 
                  ? '您通过第三方账号登录，可设置密码用于直接登录'
                  : '密码用于账户安全验证'
                }
              </p>
            </div>

            {/* Phone Number */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  手机号
                </label>
                {isPhoneBound && (
                  <Badge className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                    已验证
                  </Badge>
                )}
              </div>
              
              {isPhoneBound ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={maskedPhone}
                    readOnly
                    className="bg-muted/30 border-0 text-foreground h-10"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPhoneBound(false);
                      setPhone('');
                      setVerificationCode('');
                    }}
                    className="shrink-0 h-9"
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
                      className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendCode}
                      disabled={isSendingCode || countdown > 0 || phone.length < 11}
                      className="shrink-0 min-w-[80px] h-9"
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
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="请输入6位验证码"
                            className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent h-10"
                          />
                          <Button
                            onClick={handleVerifyPhone}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className="shrink-0 h-9 bg-accent hover:bg-accent/90"
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
          </motion.div>
        </div>

        {/* Fixed Save Button at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/30">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl"
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
        </div>
      </div>
    </AppLayout>
  );
}