import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { searchTokens, CATEGORY_LABELS, TokenInfo, AVAILABLE_TOKENS } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { ChainId } from '@/types/wallet';

interface TokenSearchProps {
  addedSymbols: string[];
  onAddToken: (token: TokenInfo, network: ChainId) => void;
  onClose: () => void;
}

type CategoryFilter = 'all' | 'stablecoin' | 'layer1' | 'layer2' | 'defi' | 'meme';

export function TokenSearch({ addedSymbols, onAddToken, onClose }: TokenSearchProps) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  const filteredTokens = useMemo(() => {
    let tokens = searchTokens(query);
    if (categoryFilter !== 'all') {
      tokens = tokens.filter(t => t.category === categoryFilter);
    }
    return tokens;
  }, [query, categoryFilter]);

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'layer1', label: '公链' },
    { id: 'stablecoin', label: '稳定币' },
    { id: 'layer2', label: 'Layer 2' },
    { id: 'defi', label: 'DeFi' },
    { id: 'meme', label: 'Meme' },
  ];

  const handleSelectNetwork = (token: TokenInfo, network: ChainId) => {
    onAddToken(token, network);
    setSelectedToken(null);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">添加代币</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索代币名称或符号..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                categoryFilter === cat.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-auto px-4 py-2">
        <AnimatePresence mode="popLayout">
          {filteredTokens.map((token, index) => {
            const isAdded = addedSymbols.includes(token.symbol);
            
            return (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
                className="py-2"
              >
                <button
                  onClick={() => !isAdded && setSelectedToken(token)}
                  disabled={isAdded}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                    isAdded 
                      ? "bg-muted/50 opacity-60 cursor-not-allowed"
                      : "bg-card hover:bg-muted/50 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={token.symbol} size="md" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{token.symbol}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {CATEGORY_LABELS[token.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="text-sm font-medium text-foreground">
                        ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toLocaleString()}
                      </p>
                      <p className={cn(
                        "text-xs flex items-center justify-end gap-0.5",
                        token.change24h >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {token.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(token.change24h)}%
                      </p>
                    </div>
                    {isAdded ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Plus className="w-5 h-5 text-accent" />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">未找到匹配的代币</p>
            <p className="text-xs text-muted-foreground mt-1">尝试其他搜索词</p>
          </div>
        )}
      </div>

      {/* Network Selection Modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-end"
            onClick={() => setSelectedToken(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-2xl p-4 border-t border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <CryptoIcon symbol={selectedToken.symbol} size="lg" />
                <div>
                  <p className="font-bold text-foreground">{selectedToken.symbol}</p>
                  <p className="text-sm text-muted-foreground">{selectedToken.name}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">选择网络添加到钱包：</p>
              
              <div className="space-y-2">
                {selectedToken.networks.map((network) => (
                  <button
                    key={network}
                    onClick={() => handleSelectNetwork(selectedToken, network)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <ChainIcon chainId={network} size="md" />
                    <span className="font-medium text-foreground capitalize">{network}</span>
                  </button>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => setSelectedToken(null)}
              >
                取消
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
