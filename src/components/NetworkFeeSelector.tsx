import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Zap, Clock, Turtle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeeTier = 'slow' | 'standard' | 'fast';

interface FeeOption {
  tier: FeeTier;
  label: string;
  labelEn: string;
  time: string;
  fee: number;
  icon: React.ReactNode;
}

interface NetworkFeeSelectorProps {
  selectedTier: FeeTier;
  onSelect: (tier: FeeTier) => void;
  networkName?: string;
}

const FEE_OPTIONS: FeeOption[] = [
  {
    tier: 'slow',
    label: '经济',
    labelEn: 'Slow',
    time: '~30分钟',
    fee: 0.80,
    icon: <Turtle className="w-5 h-5" />,
  },
  {
    tier: 'standard',
    label: '标准',
    labelEn: 'Standard',
    time: '~5分钟',
    fee: 2.50,
    icon: <Clock className="w-5 h-5" />,
  },
  {
    tier: 'fast',
    label: '快速',
    labelEn: 'Fast',
    time: '~1分钟',
    fee: 5.00,
    icon: <Zap className="w-5 h-5" />,
  },
];

export function NetworkFeeSelector({ selectedTier, onSelect, networkName = 'Ethereum' }: NetworkFeeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = FEE_OPTIONS.find(opt => opt.tier === selectedTier) || FEE_OPTIONS[1];

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[101] bg-card rounded-t-2xl overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">网络费用</h3>
                <p className="text-sm text-muted-foreground">{networkName} 网络</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Fee Options */}
            <div className="p-4 space-y-3">
              {FEE_OPTIONS.map((option) => (
                <button
                  key={option.tier}
                  onClick={() => {
                    onSelect(option.tier);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    selectedTier === option.tier 
                      ? "border-accent bg-accent/5" 
                      : "border-border hover:border-accent/50"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    option.tier === 'slow' && "bg-muted text-muted-foreground",
                    option.tier === 'standard' && "bg-accent/10 text-accent",
                    option.tier === 'fast' && "bg-warning/10 text-warning"
                  )}>
                    {option.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.labelEn}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      预计确认时间 {option.time}
                    </p>
                  </div>

                  {/* Fee */}
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground">${option.fee.toFixed(2)}</p>
                  </div>

                  {/* Selected Indicator */}
                  {selectedTier === option.tier && (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-accent-foreground rounded-full"
                      />
                    </div>
                  )}
                </button>
              ))}

              {/* Info Note */}
              <p className="text-xs text-muted-foreground text-center mt-4 px-4">
                网络费用取决于当前网络拥堵程度，实际费用可能略有浮动
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full card-elevated p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">预计网络费用</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {currentOption.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">~${currentOption.fee.toFixed(2)}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* Portal for Modal */}
      {createPortal(modal, document.body)}
    </>
  );
}
