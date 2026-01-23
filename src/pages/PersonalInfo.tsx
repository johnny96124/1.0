import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Check, Mail, Lock, Copy, Eye, EyeOff, Edit3 } from 'lucide-react';
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
  
  if (score <= 2) return { level: 'weak', label: '弱', color: 'bg-destructive' };
  if (score <= 3) return { level: 'medium', label: '中', color: 'bg-warning' };
  return { level: 'strong', label: '强', color: 'bg-success' };
}

export default function PersonalInfo() {
  const navigate = useNavigate();
  const { userInfo } = useWallet();
  
  const initialNickname = userInfo?.email?.split('@')[0] || '';
  const [nickname, setNickname] = useState(initialNickname);
  
  // Password states - check localStorage for existing password
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const userId = 'UID-2024-XXXX-XXXX';
  
  // Check if password exists on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('user_password');
    if (savedPassword) {
      setHasExistingPassword(true);
    }
  }, []);
  
  // Calculate password strength
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  
  // Check if user has made any changes
  const hasChanges = useMemo(() => {
    const nicknameChanged = nickname !== initialNickname;
    const passwordChanged = isEditingPassword && newPassword.length > 0;
    return nicknameChanged || passwordChanged;
  }, [nickname, initialNickname, isEditingPassword, newPassword]);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    toast.success('已复制到剪贴板', {
      description: '用户ID已复制',
    });
  };

  const handleStartEditPassword = () => {
    setIsEditingPassword(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelEditPassword = () => {
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async () => {
    // Validate password if editing
    if (isEditingPassword && newPassword) {
      // Check current password if user has existing password
      if (hasExistingPassword) {
        const savedPassword = localStorage.getItem('user_password');
        if (currentPassword !== savedPassword) {
          toast.error('当前密码不正确');
          return;
        }
      }
      
      if (newPassword !== confirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save new password if provided
    if (isEditingPassword && newPassword) {
      localStorage.setItem('user_password', newPassword);
      setHasExistingPassword(true);
      setIsEditingPassword(false);
    }
    
    setIsSaving(false);
    toast.success('个人信息已更新');
    navigate(-1);
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

            {/* Password Setting */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {hasExistingPassword ? '登录密码' : '设置密码'}
                </label>
                {hasExistingPassword && !isEditingPassword && (
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    已设置
                  </Badge>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {!isEditingPassword ? (
                  <motion.div
                    key="password-display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {hasExistingPassword ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            value="••••••••"
                            readOnly
                            className="bg-muted/30 border-0 text-muted-foreground cursor-not-allowed"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStartEditPassword}
                            className="shrink-0 gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            修改
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          密码可用于登录和安全验证
                        </p>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleStartEditPassword}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        设置登录密码
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="password-edit"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {/* Current password (only if has existing) */}
                    {hasExistingPassword && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">当前密码</label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="请输入当前密码"
                            className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* New password */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">新密码</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="请输入新密码"
                          className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                            <div 
                              className={`h-full rounded-full transition-all ${passwordStrength.color}`}
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
                            passwordStrength.level === 'weak' ? 'text-destructive' : 
                            passwordStrength.level === 'medium' ? 'text-warning' : 'text-success'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          建议使用8位以上，包含大小写字母、数字和特殊字符
                        </p>
                      </motion.div>
                    )}
                    
                    {/* Confirm password */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">确认新密码</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="请再次输入新密码"
                          className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-accent pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">两次输入的密码不一致</p>
                    )}
                    
                    {/* Cancel button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEditPassword}
                      className="text-muted-foreground"
                    >
                      取消修改
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
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
