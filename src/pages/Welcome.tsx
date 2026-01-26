import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Wallet, CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  description: string;
  floatingIcons: React.ReactNode[];
}

const slides: SlideData[] = [
  {
    icon: <Shield className="w-12 h-12 text-white" />,
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400',
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
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-400',
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
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
    title: '快速收款，即时到账',
    description: '支持多种数字货币收款，实时查看交易记录，让您的业务结算更加高效。',
    floatingIcons: [
      <Zap className="w-5 h-5" />,
      <TrendingUp className="w-4 h-4" />,
      <Sparkles className="w-4 h-4" />,
    ],
  },
];

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
      <Carousel
        className="flex-1 flex flex-col"
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
        <CarouselContent className="flex-1 ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              <div className="h-full flex flex-col py-8">
                {/* Illustration Area */}
                <div className="relative h-52 flex items-center justify-center">
                  {/* Background Gradient */}
                  <div 
                    className={`absolute inset-0 ${
                      index === 0 
                        ? 'bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-transparent' 
                        : index === 1 
                        ? 'bg-gradient-to-b from-violet-500/15 via-violet-500/5 to-transparent'
                        : 'bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent'
                    }`}
                  />
                  
                  {/* Animated Background Orbs */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute top-4 left-1/4 w-24 h-24 rounded-full blur-3xl ${
                      index === 0 ? 'bg-blue-500/20' : index === 1 ? 'bg-violet-500/20' : 'bg-emerald-500/20'
                    }`}
                  />
                  <motion.div
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className={`absolute bottom-4 right-1/4 w-28 h-28 rounded-full blur-3xl ${
                      index === 0 ? 'bg-cyan-400/15' : index === 1 ? 'bg-purple-400/15' : 'bg-teal-400/15'
                    }`}
                  />
                  
                  {/* Main Icon with Orbiting Elements */}
                  <div className="relative z-10">
                    {/* Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-44 h-44 -m-6"
                      style={{ transformOrigin: 'center' }}
                    >
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-400/40' : index === 1 ? 'bg-violet-400/40' : 'bg-emerald-400/40'
                      }`} />
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-cyan-400/30' : index === 1 ? 'bg-purple-400/30' : 'bg-teal-400/30'
                      }`} />
                    </motion.div>

                    {/* Floating Icons */}
                    <motion.div
                      animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute -top-6 -right-4 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                        index === 0 ? 'bg-blue-500/90 text-white' : index === 1 ? 'bg-violet-500/90 text-white' : 'bg-emerald-500/90 text-white'
                      }`}
                    >
                      {slide.floatingIcons[0]}
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className={`absolute -bottom-3 -left-6 w-7 h-7 rounded-lg flex items-center justify-center shadow-md ${
                        index === 0 ? 'bg-cyan-500/80 text-white' : index === 1 ? 'bg-purple-500/80 text-white' : 'bg-teal-500/80 text-white'
                      }`}
                    >
                      {slide.floatingIcons[1]}
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -5, 0], rotate: [0, 8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      className={`absolute top-1/2 -right-10 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                        index === 0 ? 'bg-blue-400/70 text-white' : index === 1 ? 'bg-violet-400/70 text-white' : 'bg-emerald-400/70 text-white'
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
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        className={`absolute inset-0 rounded-3xl ${
                          index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-violet-500' : 'bg-emerald-500'
                        }`}
                      />
                      
                      {/* Icon Box */}
                      <div className={`relative w-28 h-28 rounded-3xl ${slide.iconBg} flex items-center justify-center shadow-2xl`}>
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
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className={`absolute -top-1 left-0 w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-blue-400' : index === 1 ? 'bg-violet-400' : 'bg-emerald-400'
                      }`}
                    />
                    <motion.div
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                      className={`absolute bottom-3 -right-3 w-1.5 h-1.5 rounded-full ${
                        index === 0 ? 'bg-cyan-400' : index === 1 ? 'bg-purple-400' : 'bg-teal-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-6 flex-1 flex flex-col justify-center">
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
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">商户钱包</span>
                  </div>

                  {/* Title & Description */}
                  <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Fixed Buttons at Bottom */}
      <div className="px-6 pb-8 pt-4 flex gap-3 bg-background">
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
