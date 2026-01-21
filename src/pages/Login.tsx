import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Wallet, CreditCard, TrendingUp, Sparkles, X, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface SlideData {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  floatingIcons: React.ReactNode[];
}

type LoginStep = 'email' | 'password' | 'verification' | 'processing';

// Color themes for each slide
const colorThemes = [
  {
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400',
    orbColor: 'bg-blue-500/20',
    orbColor2: 'bg-cyan-400/15',
    dotColor: 'bg-blue-400/40',
    dotColor2: 'bg-cyan-400/30',
    floatingBg: ['bg-blue-500/90', 'bg-cyan-500/80', 'bg-blue-400/70'],
    sparkleColor: 'bg-blue-400',
    pulseColor: 'bg-blue-500',
  },
  {
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-400',
    orbColor: 'bg-violet-500/20',
    orbColor2: 'bg-purple-400/15',
    dotColor: 'bg-violet-400/40',
    dotColor2: 'bg-purple-400/30',
    floatingBg: ['bg-violet-500/90', 'bg-purple-500/80', 'bg-violet-400/70'],
    sparkleColor: 'bg-violet-400',
    pulseColor: 'bg-violet-500',
  },
  {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
    orbColor: 'bg-emerald-500/20',
    orbColor2: 'bg-teal-400/15',
    dotColor: 'bg-emerald-400/40',
    dotColor2: 'bg-teal-400/30',
    floatingBg: ['bg-emerald-500/90', 'bg-teal-500/80', 'bg-emerald-400/70'],
    sparkleColor: 'bg-emerald-400',
    pulseColor: 'bg-emerald-500',
  },
];

const slides: SlideData[] = [
  {
    icon: <Shield className="w-10 h-10 text-white" />,
    iconBg: colorThemes[0].iconBg,
    title: '安全管理您的数字资产',
    floatingIcons: [
      <Wallet className="w-5 h-5" />,
      <CreditCard className="w-4 h-4" />,
      <TrendingUp className="w-4 h-4" />,
    ],
  },
  {
    icon: <Lock className="w-10 h-10 text-white" />,
    iconBg: colorThemes[1].iconBg,
    title: '顶级安全，无忧交易',
    floatingIcons: [
      <Shield className="w-5 h-5" />,
      <Sparkles className="w-4 h-4" />,
      <Lock className="w-4 h-4" />,
    ],
  },
  {
    icon: <Wallet className="w-10 h-10 text-white" />,
    iconBg: colorThemes[2].iconBg,
    title: '快速收款，即时到账',
    floatingIcons: [
      <TrendingUp className="w-5 h-5" />,
      <Sparkles className="w-4 h-4" />,
      <CreditCard className="w-4 h-4" />,
    ],
  },
];

export default function LoginPage() {
  const [loginStep, setLoginStep] = useState<LoginStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [hasPassword, setHasPassword] = useState(false);
  const { login, sendVerificationCode, verifyCode, checkPasswordExists, loginWithPassword } = useWallet();
  const navigate = useNavigate();

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on('select', onSelect);
    onSelect();
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user has password and decide which step to show
  const handleContinueWithEmail = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const result = await checkPasswordExists(email);
      setHasPassword(result.hasPassword);
      
      if (result.hasPassword) {
        // User has password, show password input
        setLoginStep('password');
      } else {
        // No password, send verification code
        await sendVerificationCode(email);
        setLoginStep('verification');
        setCountdown(60);
        setCodeError('');
      }
    } catch (error) {
      console.error('Check password failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      await sendVerificationCode(email);
      setLoginStep('verification');
      setCountdown(60);
      setCodeError('');
    } catch (error) {
      console.error('Send code failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      await sendVerificationCode(email);
      setCountdown(60);
      setCodeError('');
    } catch (error) {
      console.error('Resend code failed:', error);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length !== 6) return;
    
    setIsLoading(true);
    setLoginStep('processing');
    
    try {
      const result = await verifyCode(email, code);
      
      if (result.userType === 'new') {
        // New user - go to onboarding
        navigate('/onboarding?new=true');
      } else if (result.hasExistingWallets) {
        // Returning user with wallets - go to home
        navigate('/home');
      } else {
        // Returning user without wallets - go to create wallet
        navigate('/create-wallet');
      }
    } catch (error) {
      console.error('Verify code failed:', error);
      setCodeError('验证码错误，请重试');
      setLoginStep('verification');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setVerificationCode(value);
    setCodeError('');
    if (value.length === 6) {
      handleVerifyCode(value);
    }
  };

  const handleLogin = async (provider: 'apple' | 'google' | 'email') => {
    if (provider === 'email') {
      handleContinueWithEmail();
      return;
    }
    
    setIsLoading(true);
    setLoadingProvider(provider);
    try {
      const result = await login(provider);
      if (result.userType === 'new') {
        navigate('/onboarding?new=true');
      } else if (result.hasExistingWallets) {
        navigate('/home');
      } else {
        navigate('/create-wallet');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleClearEmail = () => {
    setEmail('');
  };

  const handleBack = () => {
    if (loginStep === 'verification' || loginStep === 'password') {
      setLoginStep('email');
      setVerificationCode('');
      setCodeError('');
      setPassword('');
      setPasswordError('');
    }
  };

  // Handle password login
  const handlePasswordLogin = async () => {
    if (!password) return;
    
    setIsLoading(true);
    setLoginStep('processing');
    setPasswordError('');
    
    try {
      const result = await loginWithPassword(email, password);
      
      if (result.userType === 'new') {
        navigate('/onboarding?new=true');
      } else if (result.hasExistingWallets) {
        navigate('/home');
      } else {
        navigate('/create-wallet');
      }
    } catch (error) {
      console.error('Password login failed:', error);
      setPasswordError('密码错误，请重试');
      setLoginStep('password');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to verification code method
  const handleSwitchToVerification = async () => {
    setIsLoading(true);
    try {
      await sendVerificationCode(email);
      setLoginStep('verification');
      setCountdown(60);
      setCodeError('');
      setPassword('');
      setPasswordError('');
    } catch (error) {
      console.error('Send code failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Input Step
  const renderPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 px-6 flex flex-col"
    >
      {/* Back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">输入密码</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {/* Lock icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
        >
          <Lock className="w-8 h-8 text-accent" />
        </motion.div>
      </div>

      {/* Password Input */}
      <div className="relative mb-4">
        <Input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && password) {
              handlePasswordLogin();
            }
          }}
          className="h-14 text-base"
          disabled={isLoading}
        />
      </div>

      {/* Error message */}
      {passwordError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive text-center mb-4"
        >
          {passwordError}
        </motion.p>
      )}

      {/* Login Button */}
      <Button
        variant="default"
        size="lg"
        className="w-full h-14 text-base font-medium mb-4"
        onClick={handlePasswordLogin}
        disabled={isLoading || !password}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : null}
        登录
      </Button>

      {/* Switch to verification code */}
      <div className="text-center">
        <button
          onClick={handleSwitchToVerification}
          disabled={isLoading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          使用验证码登录
        </button>
      </div>
    </motion.div>
  );

  // Email Input Step
  const renderEmailStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 px-6 flex flex-col"
    >
      {/* Email Input */}
      <div className="relative mb-4">
        <Input
          type="email"
          placeholder="请输入邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 text-base pr-10"
        />
        {email && (
          <button
            onClick={handleClearEmail}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Continue Button */}
      <Button
        variant="default"
        size="lg"
        className="w-full h-14 text-base font-medium mb-6"
        onClick={() => handleLogin('email')}
        disabled={isLoading || !email}
      >
        {isLoading && loadingProvider === null ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : null}
        继续
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">或使用以下方式登录</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social Login Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14"
          onClick={() => handleLogin('apple')}
          disabled={isLoading}
        >
          {loadingProvider === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14"
          onClick={() => handleLogin('google')}
          disabled={isLoading}
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
        </Button>
      </div>
    </motion.div>
  );

  // Verification Code Step
  const renderVerificationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 px-6 flex flex-col"
    >
      {/* Back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">输入验证码</h2>
          <p className="text-sm text-muted-foreground">验证码已发送至 {email}</p>
        </div>
      </div>

      {/* Email icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
        >
          <Mail className="w-8 h-8 text-accent" />
        </motion.div>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center mb-4">
        <InputOTP
          maxLength={6}
          value={verificationCode}
          onChange={handleCodeChange}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error message */}
      {codeError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive text-center mb-4"
        >
          {codeError}
        </motion.p>
      )}

      {/* Resend button */}
      <div className="text-center mb-6">
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            {countdown} 秒后可重新发送
          </p>
        ) : (
          <button
            onClick={handleResendCode}
            className="text-sm text-primary hover:underline"
          >
            重新发送验证码
          </button>
        )}
      </div>

      {/* Loading indicator when verifying */}
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
    </motion.div>
  );

  // Processing Step
  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 px-6 flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
      >
        <Shield className="w-10 h-10 text-accent" />
      </motion.div>
      <p className="text-lg font-medium text-foreground mb-2">正在验证身份...</p>
      <p className="text-sm text-muted-foreground">请稍候</p>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Top Gradient Background - covers top spacing and illustration area */}
      {loginStep === 'email' && (
        <div className="relative">
          {/* Top spacing to push content down */}
          <div className="pt-10" />
          
          <Carousel
            className="flex-shrink-0 relative z-10"
            setApi={setApi}
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
              }),
            ]}
          >
            <CarouselContent className="ml-0">
              {slides.map((slide, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="relative h-52 flex items-center justify-center">
                  
                  {/* Animated Background Orbs */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-4 left-1/4 w-20 h-20 rounded-full blur-3xl ${colorThemes[index].orbColor}`}
                  />
                  <motion.div
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className={`absolute bottom-4 right-1/4 w-24 h-24 rounded-full blur-3xl ${colorThemes[index].orbColor2}`}
                  />
                  
                  {/* Main Icon with Orbiting Elements */}
                  <div className="relative z-10">
                    {/* Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-36 h-36 -m-4"
                      style={{ transformOrigin: 'center' }}
                    >
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${colorThemes[index].dotColor}`} />
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${colorThemes[index].dotColor2}`} />
                    </motion.div>

                    {/* Floating Icons */}
                    <motion.div
                      animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute -top-5 -right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${colorThemes[index].floatingBg[0]} text-white`}
                    >
                      {slide.floatingIcons[0]}
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 5, 0], x: [0, -2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className={`absolute -bottom-2 -left-5 w-6 h-6 rounded-lg flex items-center justify-center shadow-md ${colorThemes[index].floatingBg[1]} text-white`}
                    >
                      {slide.floatingIcons[1]}
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -4, 0], rotate: [0, 6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      className={`absolute top-1/2 -right-8 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${colorThemes[index].floatingBg[2]} text-white`}
                    >
                      {slide.floatingIcons[2]}
                    </motion.div>

                    {/* Main Icon Container with Pulse */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                      className="relative"
                    >
                      {/* Pulse Ring */}
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        className={`absolute inset-0 rounded-2xl ${colorThemes[index].pulseColor}`}
                      />
                      
                      {/* Icon Box */}
                      <div className={`relative w-24 h-24 rounded-2xl ${slide.iconBg} flex items-center justify-center shadow-2xl`}>
                        <motion.div
                          animate={{ rotate: [0, 4, -4, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {slide.icon}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Sparkle Effects */}
                    <motion.div
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className={`absolute -top-1 left-0 w-1.5 h-1.5 rounded-full ${colorThemes[index].sparkleColor}`}
                    />
                    <motion.div
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                      className={`absolute bottom-2 -right-2 w-1 h-1 rounded-full ${colorThemes[index].sparkleColor}`}
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      )}

      {/* Title & Progress Indicators - only show on email step */}
      {loginStep === 'email' && (
        <div className="px-6 pt-4">
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentIndex ? 24 : 6,
                  backgroundColor: i === currentIndex 
                    ? 'hsl(var(--foreground))' 
                    : 'hsl(var(--muted-foreground) / 0.3)',
                }}
                transition={{ duration: 0.3 }}
                className="h-1 rounded-full"
              />
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground text-center mb-6">
            {slides[currentIndex].title}
          </h1>
        </div>
      )}

      {/* Login Form Area */}
      <AnimatePresence mode="wait">
        {loginStep === 'email' && renderEmailStep()}
        {loginStep === 'password' && renderPasswordStep()}
        {loginStep === 'verification' && renderVerificationStep()}
        {loginStep === 'processing' && renderProcessingStep()}
      </AnimatePresence>

      {/* Terms - only show on email step */}
      {loginStep === 'email' && (
        <div className="px-6 pb-8">
          <p className="text-xs text-center text-muted-foreground">
            继续即表示您同意我们的
            <button className="text-primary ml-1">服务条款</button>
            和
            <button className="text-primary ml-1">隐私政策</button>
          </p>
        </div>
      )}
    </div>
  );
}
