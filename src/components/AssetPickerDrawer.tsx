import { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Asset, ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AssetListSkeleton } from '@/components/skeletons';

interface AssetPickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  selectedAsset?: Asset;
}

export function AssetPickerDrawer({
  open,
  onOpenChange,
  assets,
  onSelect,
  selectedAsset,
}: AssetPickerDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChain, setActiveChain] = useState<ChainId>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Chain filter
    if (activeChain !== 'all') {
      result = result.filter(asset => asset.network === activeChain);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        asset =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      );
    }

    // Sort by USD value descending
    return result.sort((a, b) => b.usdValue - a.usdValue);
  }, [assets, activeChain, searchQuery]);

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    onOpenChange(false);
    // Reset filters when closing
    setTimeout(() => {
      setSearchQuery('');
      setActiveChain('all');
    }, 300);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset filters when closing
      setTimeout(() => {
        setSearchQuery('');
        setActiveChain('all');
      }, 300);
    }
  };

  const getChainName = (chainId: ChainId): string => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    return chain?.shortName || chainId;
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-3">
          <DrawerTitle>选择币种</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col h-full max-h-[calc(85vh-60px)]">
          {/* Search Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索币种名称或符号"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-muted/50 border-0 h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Chain Filter */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setActiveChain(chain.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all border",
                    activeChain === chain.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {chain.id !== 'all' && (
                    <span className="relative z-10">
                      <ChainIcon chainId={chain.id} size="sm" />
                    </span>
                  )}
                  <span className="relative z-10">{chain.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <ScrollArea className="flex-1 px-4 pb-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <AssetListSkeleton count={5} />
              ) : filteredAssets.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? '没有找到匹配的币种' : '暂无可用币种'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1.5"
                >
                  {filteredAssets.map((asset, index) => {
                    const isSelected = 
                      selectedAsset?.symbol === asset.symbol && 
                      selectedAsset?.network === asset.network;

                    return (
                      <motion.button
                        key={`${asset.symbol}-${asset.network}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelect(asset)}
                        className={cn(
                          "w-full p-3 rounded-xl flex items-center gap-3 text-left transition-colors",
                          isSelected
                            ? "bg-accent/10 border border-accent/30"
                            : "bg-card border border-border/50 hover:bg-muted/50"
                        )}
                      >
                        {/* Token Icon with Chain Badge */}
                        <div className="relative shrink-0">
                          <CryptoIcon symbol={asset.symbol} size="lg" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-card flex items-center justify-center">
                            <ChainIcon chainId={asset.network} size="sm" />
                          </div>
                        </div>

                        {/* Token Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {asset.symbol}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {getChainName(asset.network)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {asset.name}
                          </p>
                        </div>

                        {/* Balance */}
                        <div className="text-right shrink-0">
                          <p className="font-medium text-foreground">
                            {asset.balance.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${asset.usdValue.toLocaleString()}
                          </p>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <Check className="w-5 h-5 text-accent shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
