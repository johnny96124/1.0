import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';
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
  title: string;
  description: string;
}

const slides: SlideData[] = [
  {
    icon: <Shield className="w-10 h-10 text-white" />,
    iconBg: 'bg-primary',
    title: '轻松管理您的数字资产',
    description: '一站式管理您的收款和结算资金，安全便捷的交易体验，随时随地掌控您的财务。',
  },
  {
    icon: <Lock className="w-10 h-10 text-white" />,
    iconBg: 'bg-emerald-500',
    title: '顶级安全，无忧交易',
    description: '采用MPC多方计算技术保护您的资产，非托管设计确保只有您能控制自己的资金。',
  },
  {
    icon: <Zap className="w-10 h-10 text-white" />,
    iconBg: 'bg-amber-500',
    title: '快速收款，即时到账',
    description: '支持多种数字货币收款，实时查看交易记录，让您的业务结算更加高效。',
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

  // Set up callback when API is ready
  useState(() => {
    if (!api) return;
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  });

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Carousel Section */}
      <div className="flex-1 flex flex-col">
        <Carousel
          className="flex-1"
          setApi={setApi}
          opts={{
            align: 'start',
            loop: false,
          }}
        >
          <CarouselContent className="h-full ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full pl-0">
                <div className="h-full flex flex-col">
                  {/* Illustration Area */}
                  <div className="flex-1 relative overflow-hidden">
                    <div 
                      className={`absolute inset-0 ${
                        index === 0 
                          ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-background' 
                          : index === 1 
                          ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-background'
                          : 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-background'
                      }`}
                    />
                    
                    {/* Abstract Pattern */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                      >
                        {/* Decorative circles */}
                        <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full ${
                          index === 0 ? 'bg-primary/10' : index === 1 ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        } blur-2xl`} />
                        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${
                          index === 0 ? 'bg-primary/15' : index === 1 ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                        } blur-xl`} />
                        
                        {/* Main Icon Container */}
                        <div className={`w-32 h-32 rounded-3xl ${slide.iconBg} flex items-center justify-center shadow-2xl`}>
                          {slide.icon}
                        </div>
                        
                        {/* Floating elements */}
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className={`absolute -top-4 -right-4 w-8 h-8 rounded-lg ${
                            index === 0 ? 'bg-primary/30' : index === 1 ? 'bg-emerald-500/30' : 'bg-amber-500/30'
                          }`}
                        />
                        <motion.div
                          animate={{ y: [0, 6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                          className={`absolute -bottom-2 -left-6 w-6 h-6 rounded-full ${
                            index === 0 ? 'bg-primary/25' : index === 1 ? 'bg-emerald-500/25' : 'bg-amber-500/25'
                          }`}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-6 pb-4">
                    {/* Progress Indicators */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {slides.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            i === currentIndex
                              ? 'w-8 bg-foreground'
                              : 'w-2 bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Brand */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">商户钱包</span>
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
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
