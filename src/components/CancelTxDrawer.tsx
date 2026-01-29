/**
 * Cancel Transaction Drawer
 * 
 * Allows users to cancel a pending transaction by sending
 * a replacement transaction with the same nonce.
 */

import { X, AlertTriangle, Wallet } from 'lucide-react';
import { Transaction, SUPPORTED_CHAINS } from '@/types/wallet';
import { calculateCancelFee, getGasToken } from '@/lib/rbf-utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';

interface CancelTxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onConfirm: (cancelFee: number, cancelGasAmount: number) => void;
}

export function CancelTxDrawer({ open, onOpenChange, transaction, onConfirm }: CancelTxDrawerProps) {
  const currentFee = transaction.gasPrice || transaction.fee || 2.50;
  const currentGasAmount = transaction.gasAmount || 0.00072;
  const gasToken = transaction.gasToken || getGasToken(transaction.network);
  
  const cancelFeeInfo = calculateCancelFee(currentFee, currentGasAmount);
  const networkName = SUPPORTED_CHAINS.find(c => c.id === transaction.network)?.name || transaction.network;

  const handleConfirm = () => {
    onConfirm(cancelFeeInfo.fee, cancelFeeInfo.gasAmount);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        {/* Header */}
        <DrawerHeader className="flex flex-row items-start justify-between p-4 pb-2 text-left">
          <div>
            <DrawerTitle className="text-lg font-semibold text-foreground">取消交易</DrawerTitle>
            <p className="text-sm text-muted-foreground mt-1">{networkName} 网络</p>
          </div>
          <DrawerClose asChild>
            <button className="p-2 -mr-2 -mt-1 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Warning Card */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">确定要取消这笔交易吗？</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                取消将发送一笔替换交易使原交易失效，需支付网络费用。
              </p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  -{transaction.amount} {transaction.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${transaction.usdValue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              收款方：{transaction.counterparty.slice(0, 10)}...{transaction.counterparty.slice(-8)}
            </div>
          </div>

          {/* Fee Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">原网络费用</span>
              <span className="text-sm text-foreground">${currentFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">取消费用</span>
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">
                  {cancelFeeInfo.gasAmount.toFixed(5)} {gasToken}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ≈ ${cancelFeeInfo.fee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Return Note */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs text-muted-foreground flex-1">
              取消成功后，原资金将返回您的钱包
            </p>
          </div>
        </div>
        {/* Footer */}
        <DrawerFooter className="px-4 pb-6 gap-2">
          <Button 
            variant="destructive"
            className="w-full gap-2 h-12"
            onClick={handleConfirm}
          >
            <X className="w-4 h-4" />
            确认取消
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-12">
              返回
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
