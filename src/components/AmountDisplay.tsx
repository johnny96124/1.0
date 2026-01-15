import { motion } from 'framer-motion';
import { CryptoIcon } from '@/components/CryptoIcon';
import { cn } from '@/lib/utils';

interface AmountDisplayProps {
  amount: string;
  symbol: string;
  tokenPrice: number;
  maxBalance: number;
  onMaxClick: () => void;
  className?: string;
}

export function AmountDisplay({
  amount,
  symbol,
  tokenPrice,
  maxBalance,
  onMaxClick,
  className,
}: AmountDisplayProps) {
  const numAmount = parseFloat(amount) || 0;
  const isExceedMax = numAmount > maxBalance;
  
  // Display token amount
  const displayAmount = `${numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} ${symbol}`;
  
  // USD conversion
  const usdValue = numAmount * tokenPrice;
  const usdText = `≈ $${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      {/* Token Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <CryptoIcon symbol={symbol} size="lg" className="w-12 h-12" />
        </div>
      </motion.div>

      {/* Main Amount Display */}
      <div className="relative flex items-center gap-3">
        <motion.div
          key={displayAmount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-4xl font-bold tracking-tight",
            isExceedMax ? "text-destructive" : "text-foreground"
          )}
        >
          {amount === '' || amount === '0' ? (
            <span className="text-muted-foreground">0 {symbol}</span>
          ) : (
            displayAmount
          )}
        </motion.div>
      </div>

      {/* USD Conversion */}
      <motion.p
        key={usdText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground mt-2"
      >
        {amount && parseFloat(amount) > 0 ? usdText : ''}
      </motion.p>

      {/* Error Message */}
      {isExceedMax && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-sm mt-2"
        >
          余额不足，最多可转 {maxBalance.toLocaleString()} {symbol}
        </motion.p>
      )}
    </div>
  );
}
