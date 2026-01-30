import { useState } from 'react';
import { Fingerprint, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface UnlockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
}

export function UnlockDrawer({ open, onOpenChange, onUnlock }: UnlockDrawerProps) {
  const { hasBiometric } = useWallet();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(!hasBiometric);

  const handleBiometricAuth = async () => {
    console.log('[AppLock] biometric auth start');
    setIsLoading(true);
    setError('');
    
    // Simulate biometric authentication
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo, always succeed
    setIsLoading(false);
    console.log('[AppLock] biometric auth success -> unlock');
    onUnlock();
    onOpenChange(false);
  };

  const handlePasswordSubmit = async () => {
    console.log('[AppLock] password submit start');
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate password verification
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo, accept any 6+ character password
    if (password.length >= 6) {
      setIsLoading(false);
      setPassword('');
      console.log('[AppLock] password verify success -> unlock');
      onUnlock();
      onOpenChange(false);
    } else {
      setIsLoading(false);
      setError('密码错误，请重试');
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Block user-initiated closing (e.g. swipe down / click overlay) until authenticated.
    // Allow opening interactions to flow through.
    if (nextOpen) onOpenChange(true);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center">身份验证</DrawerTitle>
          <DrawerDescription className="sr-only">
            使用生物识别或支付密码验证身份以解锁应用。
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-6 pb-8 space-y-6">
          <AnimatePresence mode="wait">
            {!showPasswordInput && hasBiometric ? (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center space-y-6"
              >
                <button
                  onClick={handleBiometricAuth}
                  disabled={isLoading}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  <Fingerprint className={cn(
                    "w-10 h-10 text-primary",
                    isLoading && "animate-pulse"
                  )} />
                </button>
                
                <p className="text-sm text-muted-foreground text-center">
                  点击使用生物识别解锁
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordInput(true)}
                  className="text-muted-foreground"
                >
                  使用密码解锁
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="请输入支付密码"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className={cn(error && "border-destructive")}
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handlePasswordSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? '验证中...' : '确认'}
                </Button>

                {hasBiometric && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordInput(false)}
                    className="w-full text-muted-foreground"
                  >
                    使用生物识别
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
