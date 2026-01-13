import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Wallet, CreditCard, TrendingUp, Sparkles, X, Loader2 } from 'lucide-react';
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

interface SlideData {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  floatingIcons: React.ReactNode[];
}

const slides: SlideData[] = [
  {
    icon: <Shield className="w-10 h-10 text-white" />,
    iconBg: 'bg-gradient-to-br from-primary to-primary/80',
    title: '安全管理您的数字资产',
    floatingIcons: [
      <Wallet className="w-5 h-5" />,
      <CreditCard className="w-4 h-4" />,
      <TrendingUp className="w-4 h-4" />,
    ],
  },
  {
    icon: <Lock className="w-10 h-10 text-white" />,
    iconBg: 'bg-gradient-to-br from-primary to-primary/80',
    title: '顶级安全，无忧交易',
    floatingIcons: [
      <Shield className="w-5 h-5" />,
      <Sparkles className="w-4 h-4" />,
      <Lock className="w-4 h-4" />,
    ],
  },
  {
    icon: <Wallet className="w-10 h-10 text-white" />,
    iconBg: 'bg-gradient-to-br from-primary to-primary/80',
    title: '快速收款，即时到账',
    floatingIcons: [
      <TrendingUp className="w-5 h-5" />,
      <Sparkles className="w-4 h-4" />,
      <CreditCard className="w-4 h-4" />,
    ],
  },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const { login } = useWallet();
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

  const handleClearEmail = () => {
    setEmail('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Top Gradient Background - covers top spacing and illustration area */}
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
                  className="absolute top-4 left-1/4 w-20 h-20 rounded-full blur-3xl bg-primary/20"
                />
                <motion.div
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-4 right-1/4 w-24 h-24 rounded-full blur-3xl bg-primary/15"
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
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary/40" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/30" />
                  </motion.div>

                  {/* Floating Icons */}
                  <motion.div
                    animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-5 -right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-primary/90 text-white"
                  >
                    {slide.floatingIcons[0]}
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 5, 0], x: [0, -2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -bottom-2 -left-5 w-6 h-6 rounded-lg flex items-center justify-center shadow-md bg-primary/80 text-white"
                  >
                    {slide.floatingIcons[1]}
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -4, 0], rotate: [0, 6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute top-1/2 -right-8 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-md bg-primary/70 text-white"
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
                      className="absolute inset-0 rounded-2xl bg-primary"
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
                    className="absolute -top-1 left-0 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                  <motion.div
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                    className="absolute bottom-2 -right-2 w-1 h-1 rounded-full bg-primary"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>

      {/* Title & Progress Indicators */}
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

      {/* Login Form Area */}
      <div className="flex-1 px-6 flex flex-col">
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
          {loadingProvider === 'email' ? (
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
      </div>

      {/* Terms */}
      <div className="px-6 pb-8">
        <p className="text-xs text-center text-muted-foreground">
          继续即表示您同意我们的
          <button className="text-primary ml-1">服务条款</button>
          和
          <button className="text-primary ml-1">隐私政策</button>
        </p>
      </div>
    </div>
  );
}
