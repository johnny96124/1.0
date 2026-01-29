/**
 * RBF Action Section Component
 * 
 * Displays in transaction detail drawer when a pending send transaction
 * can be accelerated or cancelled via RBF.
 */

import { Rocket, X, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/wallet';
import { getRbfSupport, formatWaitTime } from '@/lib/rbf-utils';
import { cn } from '@/lib/utils';

interface RbfActionSectionProps {
  transaction: Transaction;
  onSpeedUp: () => void;
  onCancel: () => void;
}

export function RbfActionSection({ transaction, onSpeedUp, onCancel }: RbfActionSectionProps) {
  const rbfSupport = getRbfSupport(transaction);
  
  // Don't render anything if RBF is not applicable
  if (!rbfSupport.canSpeedUp && !rbfSupport.canCancel) {
    // Show reason if it's a pending send tx on unsupported network
    if (transaction.status === 'pending' && transaction.type === 'send' && rbfSupport.reason) {
      return (
        <div className="p-3 rounded-xl bg-muted/50 border border-border mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{rbfSupport.reason}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const waitTime = formatWaitTime(transaction.timestamp);

  return (
    <div className="mb-4">
      {/* Info Card */}
      <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 mb-3">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">交易等待确认中</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              已等待 {waitTime}，网络拥堵可能导致确认延迟
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="default"
          className="flex-1 gap-2 h-10"
          onClick={onSpeedUp}
        >
          <Rocket className="w-4 h-4" />
          加速交易
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 h-10"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
          取消交易
        </Button>
      </div>
    </div>
  );
}
