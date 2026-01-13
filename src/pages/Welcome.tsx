import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Wallet, CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface SlideData {
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  title: string;
  description: string;
  floatingIcons: React.ReactNode[];
}

const slides: SlideData[] = [
  {
    icon: <Shield className="w-12 h-12 text-white" />,
    iconBg: 'bg-gradient-to-br from-primary to-primary/80',
    accentColor: 'primary',
    title: '轻松管理您的数字资产',
    description: '一站式管理您的收款和结算资金，安全便捷的交易体验，随时随地掌控您的财务。',
    floatingIcons: [
      <Wallet className="w-5 h-5" />,
      <CreditCard className="w-4 h-4" />,
      <TrendingUp className="w-4 h-4" />,
    ],
  },
  {
    icon: <Lock className="w-12 h-12 text-white" />,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    accentColor: 'emerald',
    title: '顶级安全，无忧交易',
    description: '采用MPC多方计算技术保护您的资产，非托管设计确保只有您能控制自己的资金。',
    floatingIcons: [
      <Shield className="w-5 h-5" />,
      <Sparkles className="w-4 h-4" />,
      <Lock className="w-4 h-4" />,
    ],
  },
  {
    icon: <Zap className="w-12 h-12 text-white" />,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    accentColor: 'amber',
    title: '快速收款，即时到账',
    description: '支持多种数字货币收款，实时查看交易记录，让您的业务结算更加高效。',
    floatingIcons: [
      <Zap className="w-5 h-5" />,
      <TrendingUp className="w-4 h-4" />,
      <Sparkles className="w-4 h-4" />,
    ],
  },
];

const getColorClass = (accentColor: string, type: 'bg' | 'border' | 'text', opacity?: number) => {
  const opacityStr = opacity ? `/${opacity}` : '';
  if (accentColor === 'primary') return `${type}-primary${opacityStr}`;
  if (accentColor === 'emerald') return `${type}-emerald-500${opacityStr}`;
  if (accentColor === 'amber') return `${type}-amber-500${opacityStr}`;
  return `${type}-primary${opacityStr}`;
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Carousel Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <Carousel
          className="flex-1 flex flex-col"
          setApi={setApi}
          opts={{
            align: 'start',
            loop: false,
          }}
        >
          <CarouselContent className="flex-1 ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full pl-0">
                <div className="h-full flex flex-col">
                  {/* Illustration Area - Centered */}
                  <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                    {/* Background Gradient */}
                    <div 
                      className={`absolute inset-0 ${
                        index === 0 
                          ? 'bg-gradient-to-b from-primary/15 via-primary/5 to-transparent' 
                          : index === 1 
                          ? 'bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent'
                          : 'bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent'
                      }`}
                    />
                    
                    {/* Animated Background Orbs */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl ${
                        index === 0 ? 'bg-primary/20' : index === 1 ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}
                    />
                    <motion.div
                      animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      className={`absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full blur-3xl ${
                        index === 0 ? 'bg-primary/15' : index === 1 ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                      }`}
                    />
                    
                    {/* Main Icon with Orbiting Elements */}
                    <div className="relative">
                      {/* Outer Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 w-48 h-48 -m-8"
                        style={{ transformOrigin: 'center' }}
                      >
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary/40' : index === 1 ? 'bg-emerald-500/40' : 'bg-amber-500/40'
                        }`} />
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-primary/30' : index === 1 ? 'bg-emerald-500/30' : 'bg-amber-500/30'
                        }`} />
                      </motion.div>

                      {/* Inner Ring */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 w-40 h-40 -m-4"
                        style={{ transformOrigin: 'center' }}
                      >
                        <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                          index === 0 ? 'bg-primary/50' : index === 1 ? 'bg-emerald-500/50' : 'bg-amber-500/50'
                        }`} />
                        <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-primary/35' : index === 1 ? 'bg-emerald-500/35' : 'bg-amber-500/35'
                        }`} />
                      </motion.div>

                      {/* Floating Icons */}
                      <motion.div
                        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute -top-8 -right-6 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                          index === 0 ? 'bg-primary/90 text-white' : index === 1 ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                        }`}
                      >
                        {slide.floatingIcons[0]}
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className={`absolute -bottom-4 -left-8 w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                          index === 0 ? 'bg-primary/80 text-white' : index === 1 ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'
                        }`}
                      >
                        {slide.floatingIcons[1]}
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className={`absolute top-1/2 -right-12 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                          index === 0 ? 'bg-primary/70 text-white' : index === 1 ? 'bg-emerald-500/70 text-white' : 'bg-amber-500/70 text-white'
                        }`}
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
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                          className={`absolute inset-0 rounded-3xl ${
                            index === 0 ? 'bg-primary' : index === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        
                        {/* Icon Box */}
                        <div className={`relative w-32 h-32 rounded-3xl ${slide.iconBg} flex items-center justify-center shadow-2xl`}>
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {slide.icon}
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Sparkle Effects */}
                      <motion.div
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        className={`absolute -top-2 left-0 w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-primary' : index === 1 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <motion.div
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                        className={`absolute bottom-4 -right-4 w-1.5 h-1.5 rounded-full ${
                          index === 0 ? 'bg-primary' : index === 1 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <motion.div
                        animate={{ 
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                        className={`absolute top-8 -left-6 w-1.5 h-1.5 rounded-full ${
                          index === 0 ? 'bg-primary' : index === 1 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-6 pb-4 pt-6">
                    {/* Progress Indicators */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {slides.map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            width: i === currentIndex ? 32 : 8,
                            backgroundColor: i === currentIndex 
                              ? 'hsl(var(--foreground))' 
                              : 'hsl(var(--muted-foreground) / 0.3)',
                          }}
                          transition={{ duration: 0.3 }}
                          className="h-1 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Brand */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">商户钱包</span>
                    </motion.div>

                    {/* Title & Description */}
                    <motion.h1 
                      key={`title-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-foreground mb-3 leading-tight"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      key={`desc-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-muted-foreground text-sm leading-relaxed"
                    >
                      {slide.description}
                    </motion.p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-8 pt-4 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-12 text-base font-medium"
          onClick={handleLogin}
        >
          注册
        </Button>
        <Button
          variant="default"
          size="lg"
          className="flex-1 h-12 text-base font-medium"
          onClick={handleLogin}
        >
          登录
        </Button>
      </div>
    </div>
  );
}
