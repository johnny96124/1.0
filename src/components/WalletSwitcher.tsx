import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Wallet, Download, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { getWalletTotalBalance } from '@/contexts/WalletContext';

interface WalletSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onImport: () => void;
}

export function WalletSwitcher({ isOpen, onClose, onCreateNew, onImport }: WalletSwitcherProps) {
  const { wallets, currentWallet, switchWallet } = useWallet();

  const handleSelect = (walletId: string) => {
    if (walletId !== currentWallet?.id) {
      switchWallet(walletId);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full bg-card rounded-t-2xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-4">切换钱包</h3>
            
            {/* Wallet List */}
            <div className="space-y-2 mb-4">
              {wallets.map((wallet) => {
                const isActive = wallet.id === currentWallet?.id;
                const balance = getWalletTotalBalance(wallet.id);
                const isEscaped = wallet.isEscaped;
                
                return (
                  <motion.button
                    key={wallet.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(wallet.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                      isActive 
                        ? "bg-accent/10 border border-accent/30" 
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    {/* Wallet Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      isActive ? "gradient-primary" : isEscaped ? "bg-warning/10" : "bg-muted"
                    )}>
                      {isEscaped ? (
                        <Key className={cn(
                          "w-5 h-5",
                          isActive ? "text-primary-foreground" : "text-warning"
                        )} />
                      ) : (
                        <Wallet className={cn(
                          "w-5 h-5",
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                    
                    {/* Wallet Info */}
                    <div className="flex-1 text-left">
                      <p className={cn(
                        "font-medium text-sm",
                        isActive ? "text-accent" : "text-foreground"
                      )}>
                        {wallet.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Check Mark */}
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-11 border-dashed"
                onClick={onImport}
              >
                <Download className="w-4 h-4 mr-2" />
                导入钱包
              </Button>
              <Button
                className="flex-1 h-11"
                onClick={onCreateNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                创建钱包
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
