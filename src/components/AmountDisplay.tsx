import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { CryptoIcon } from '@/components/CryptoIcon';
import { cn } from '@/lib/utils';

interface AmountDisplayProps {
  amount: string;
  symbol: string;
  usdValue: number;
  isUsdMode: boolean;
  onToggleMode: () => void;
  tokenPrice: number;
  className?: string;
}

export function AmountDisplay({
  amount,
  symbol,
  usdValue,
  isUsdMode,
  onToggleMode,
  tokenPrice,
  className,
}: AmountDisplayProps) {
  const numAmount = parseFloat(amount) || 0;
  
  // Calculate conversions
  const displayAmount = isUsdMode 
    ? `$${numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : `${numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} ${symbol}`;
  
  const conversionText = isUsdMode
    ? `~${(numAmount / tokenPrice).toFixed(4)} ${symbol}`
    : `$${(numAmount * tokenPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      {/* Token Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-4"
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
          <CryptoIcon symbol={symbol} size="lg" className="w-10 h-10" />
        </div>
      </motion.div>

      {/* Main Amount Display */}
      <div className="relative flex items-center gap-3">
        <motion.div
          key={displayAmount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-foreground tracking-tight"
        >
          {amount === '' || amount === '0' ? (
            <span className="text-muted-foreground">
              {isUsdMode ? '$0' : `0 ${symbol}`}
            </span>
          ) : (
            displayAmount
          )}
        </motion.div>

        {/* Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMode}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Conversion Display */}
      <motion.p
        key={conversionText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground mt-2"
      >
        {amount && parseFloat(amount) > 0 ? conversionText : ''}
      </motion.p>
    </div>
  );
}
