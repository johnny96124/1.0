import { Globe, Zap, CreditCard, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// PSP brand configurations with unique colors and icons
const pspBrands: Record<string, { 
  icon: React.ElementType; 
  bgGradient: string; 
  iconColor: string;
  letter?: string;
}> = {
  'psp-1': { // PayGlobal
    icon: Globe,
    bgGradient: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-500',
  },
  'psp-2': { // FastPay Asia
    icon: Zap,
    bgGradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-500',
  },
  'psp-3': { // UniPay
    icon: CreditCard,
    bgGradient: 'from-emerald-500/20 to-green-500/10',
    iconColor: 'text-emerald-500',
  },
  'psp-4': { // CrossBorder Pay
    icon: ArrowLeftRight,
    bgGradient: 'from-purple-500/20 to-violet-500/10',
    iconColor: 'text-purple-500',
  },
};

// Fallback colors for unknown PSPs
const fallbackColors = [
  { bgGradient: 'from-rose-500/20 to-pink-500/10', iconColor: 'text-rose-500' },
  { bgGradient: 'from-cyan-500/20 to-teal-500/10', iconColor: 'text-cyan-500' },
  { bgGradient: 'from-indigo-500/20 to-blue-500/10', iconColor: 'text-indigo-500' },
  { bgGradient: 'from-lime-500/20 to-green-500/10', iconColor: 'text-lime-500' },
];

interface PSPLogoProps {
  pspId: string;
  pspName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PSPLogo({ pspId, pspName, size = 'md', className }: PSPLogoProps) {
  const brand = pspBrands[pspId];
  
  // Generate consistent fallback based on pspId hash
  const getFallback = () => {
    const hash = pspId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackColors[hash % fallbackColors.length];
  };
  
  const { bgGradient, iconColor } = brand || getFallback();
  const Icon = brand?.icon || Globe;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <div 
      className={cn(
        'rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
        bgGradient,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], iconColor)} />
    </div>
  );
}
