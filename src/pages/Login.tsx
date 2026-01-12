import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const { login } = useWallet();
  const navigate = useNavigate();

  const handleLogin = async (provider: 'apple' | 'google' | 'email') => {
    setIsLoading(true);
    setLoadingProvider(provider);
    try {
      await login(provider);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-8 shadow-lg"
        >
          <Shield className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground text-center mb-2"
        >
          欢迎使用商户钱包
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center text-sm max-w-[280px]"
        >
          安全管理您的收款与结算资金
        </motion.p>

        {/* Security badges */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4 mt-8"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>非托管设计</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>多重安全保护</span>
          </div>
        </motion.div>
      </div>

      {/* Login Options */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6 pb-12 space-y-3"
      >
        <Button
          variant="default"
          size="lg"
          className="w-full h-14 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
          onClick={() => handleLogin('apple')}
          disabled={isLoading}
        >
          {loadingProvider === 'apple' ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
          )}
          继续使用 Apple 登录
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={() => handleLogin('google')}
          disabled={isLoading}
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          继续使用 Google 登录
        </Button>

        {!showEmailInput ? (
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-14 text-base font-medium text-muted-foreground"
            onClick={() => setShowEmailInput(true)}
            disabled={isLoading}
          >
            <Mail className="w-5 h-5 mr-2" />
            使用邮箱登录
          </Button>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-3"
          >
            <Input
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-base"
            />
            <Button
              variant="default"
              size="lg"
              className="w-full h-14 text-base font-medium"
              onClick={() => handleLogin('email')}
              disabled={isLoading || !email}
            >
              {loadingProvider === 'email' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              发送验证码
            </Button>
          </motion.div>
        )}

        <p className="text-xs text-center text-muted-foreground pt-4">
          继续即表示您同意我们的
          <button className="text-accent ml-1">服务条款</button>
          和
          <button className="text-accent ml-1">隐私政策</button>
        </p>
      </motion.div>
    </div>
  );
}
