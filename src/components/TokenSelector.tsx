import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check } from 'lucide-react';
import { Asset, ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { cn } from '@/lib/utils';

interface TokenSelectorProps {
  assets: Asset[];
  selectedAsset: Asset;
  onSelect: (asset: Asset) => void;
}

export function TokenSelector({ assets, selectedAsset, onSelect }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getChainName = (chainId: ChainId): string => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain?.shortName || chainId;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
      >
        <CryptoIcon symbol={selectedAsset.symbol} size="sm" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{selectedAsset.symbol}</span>
          <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
            {getChainName(selectedAsset.network)}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-2xl max-h-[70vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">选择币种</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Asset List */}
              <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
                {assets.map((asset) => (
                  <button
                    key={`${asset.symbol}-${asset.network}`}
                    onClick={() => {
                      onSelect(asset);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                      selectedAsset.symbol === asset.symbol && selectedAsset.network === asset.network && "bg-accent/5"
                    )}
                  >
                    {/* Token Icon with Chain Badge */}
                    <div className="relative">
                      <CryptoIcon symbol={asset.symbol} size="lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-card flex items-center justify-center">
                        <ChainIcon chainId={asset.network} size="sm" />
                      </div>
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{asset.symbol}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {getChainName(asset.network)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>

                    {/* Balance */}
                    <div className="text-right">
                      <p className="font-medium">{asset.balance.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ${asset.usdValue.toLocaleString()}
                      </p>
                    </div>

                    {/* Selected Indicator */}
                    {selectedAsset.symbol === asset.symbol && selectedAsset.network === asset.network && (
                      <Check className="w-5 h-5 text-accent shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
