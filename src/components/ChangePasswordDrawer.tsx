import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type Step = 'verify' | 'new-password' | 'success';

interface ChangePasswordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasExistingPassword: boolean;
  onSuccess: () => void;
}

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

export function ChangePasswordDrawer({
  open,
  onOpenChange,
  hasExistingPassword,
  onSuccess,
}: ChangePasswordDrawerProps) {
  const [step, setStep] = useState<Step>(hasExistingPassword ? 'verify' : 'new-password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const handleVerifyPassword = async () => {
    setError('');
    setIsLoading(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const savedPassword = localStorage.getItem('user_password');
    if (currentPassword !== savedPassword) {
      setError('当前密码不正确');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    setStep('new-password');
  };

  const handleSetNewPassword = async () => {
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem('user_password', newPassword);
    setIsLoading(false);
    setStep('success');
    
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep(hasExistingPassword ? 'verify' : 'new-password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }, 300);
  };

  const getTitle = () => {
    switch (step) {
      case 'verify':
        return '验证当前密码';
      case 'new-password':
        return hasExistingPassword ? '设置新密码' : '设置登录密码';
      case 'success':
        return '密码设置成功';
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {getTitle()}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Verify current password */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground text-center mb-4">
                  请输入当前密码以验证身份
                </p>
                
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="请输入当前密码"
                    className="h-12 text-base pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
                
                <Button
                  className="w-full h-12"
                  onClick={handleVerifyPassword}
                  disabled={!currentPassword || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      验证密码
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 2: Set new password */}
            {step === 'new-password' && (
              <motion.div
                key="new-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground text-center mb-4">
                  请设置您的新密码
                </p>
                
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">新密码</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="请输入新密码"
                      className="h-12 text-base pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">密码强度:</span>
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((segment) => (
                          <div
                            key={segment}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              segment === 1 ? passwordStrength.color :
                              segment === 2 && (passwordStrength.level === 'medium' || passwordStrength.level === 'strong') ? passwordStrength.color :
                              segment === 3 && passwordStrength.level === 'strong' ? passwordStrength.color :
                              'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${
                        passwordStrength.level === 'weak' ? 'text-destructive' :
                        passwordStrength.level === 'medium' ? 'text-warning' : 'text-success'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">确认新密码</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="请再次输入新密码"
                      className="h-12 text-base pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  建议使用8位以上，包含大小写字母、数字和特殊字符
                </p>
                
                <Button
                  className="w-full h-12"
                  onClick={handleSetNewPassword}
                  disabled={!newPassword || !confirmPassword || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '确认设置'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  密码设置成功
                </h3>
                <p className="text-sm text-muted-foreground">
                  您的登录密码已更新
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
