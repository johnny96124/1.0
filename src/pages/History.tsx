import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Send, TrendingDown, 
  CheckCircle2, AlertCircle, XCircle,
  ExternalLink, Copy, ChevronRight, Clock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { Transaction, SUPPORTED_CHAINS } from '@/types/wallet';
import { PullToRefresh } from '@/components/PullToRefresh';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { transactions } = useWallet();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (filter !== 'all' && tx.type !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.counterparty.toLowerCase().includes(query) ||
          tx.counterpartyLabel?.toLowerCase().includes(query) ||
          tx.txHash.toLowerCase().includes(query) ||
          tx.symbol.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [transactions, filter, searchQuery]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('交易记录已刷新');
  }, []);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return '已完成';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
    }
  };

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground mb-4">交易记录</h1>

        {/* Search & Filter */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索交易..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'send', 'receive'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1',
                  filter === f && 'bg-accent text-accent-foreground'
                )}
              >
                {f === 'all' && '全部'}
                {f === 'send' && '转出'}
                {f === 'receive' && '收入'}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <motion.button
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full card-elevated p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        tx.type === 'receive' ? 'bg-success/10' : 'bg-accent/10'
                      )}>
                        {tx.type === 'receive' ? (
                          <TrendingDown className="w-5 h-5 text-success rotate-180" />
                        ) : (
                          <Send className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.counterpartyLabel || tx.counterparty.slice(0, 10) + '...'}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(tx.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className={cn(
                          'font-medium',
                          tx.type === 'receive' ? 'text-success' : 'text-foreground'
                        )}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${tx.usdValue.toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="card-elevated p-8 text-center">
              <p className="text-muted-foreground">暂无交易记录</p>
            </div>
          )}
        </div>
        </div>
      </PullToRefresh>

      {/* Transaction Detail Drawer - Matching Home page style */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-2xl p-6 pb-8 max-h-[80%] overflow-auto"
            >
              {/* Drawer Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-muted rounded-full" />
              </div>

              {/* Hero Section: Token Icon + Amount */}
              <div className="relative mb-6">
                {/* Large Token Icon as Hero */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center shadow-lg">
                      <CryptoIcon symbol={selectedTx.symbol} size="xl" />
                    </div>
                    {/* Status Badge Overlay */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-card",
                      selectedTx.status === 'confirmed' && "bg-success",
                      selectedTx.status === 'pending' && "bg-warning",
                      selectedTx.status === 'failed' && "bg-destructive"
                    )}>
                      {selectedTx.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      {selectedTx.status === 'pending' && <Clock className="w-3.5 h-3.5 text-white" />}
                      {selectedTx.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="text-center">
                  <p className={cn(
                    'text-3xl font-bold tracking-tight',
                    selectedTx.type === 'receive' ? 'text-success' : 'text-foreground'
                  )}>
                    {selectedTx.type === 'receive' ? '+' : '-'}{selectedTx.amount} {selectedTx.symbol}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    ≈ ${selectedTx.usdValue.toLocaleString()}
                  </p>
                </div>

                {/* Status Tag */}
                <div className="flex justify-center mt-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                    selectedTx.status === 'confirmed' && "bg-success/10 text-success",
                    selectedTx.status === 'pending' && "bg-warning/10 text-warning",
                    selectedTx.status === 'failed' && "bg-destructive/10 text-destructive"
                  )}>
                    {selectedTx.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                    {selectedTx.status === 'pending' && <Clock className="w-3 h-3" />}
                    {selectedTx.status === 'failed' && <XCircle className="w-3 h-3" />}
                    {selectedTx.type === 'receive' ? '收款' : '转账'}
                    {selectedTx.status === 'confirmed' && '已完成'}
                    {selectedTx.status === 'pending' && '处理中'}
                    {selectedTx.status === 'failed' && '失败'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <span className="text-muted-foreground">
                    {selectedTx.type === 'receive' ? '付款方' : '收款方'}
                  </span>
                  <div className="text-right">
                    {selectedTx.counterpartyLabel && (
                      <p className="font-medium text-foreground">{selectedTx.counterpartyLabel}</p>
                    )}
                    <p className="text-sm text-muted-foreground font-mono">
                      {`${selectedTx.counterparty.slice(0, 10)}...${selectedTx.counterparty.slice(-8)}`}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">网络</span>
                  <div className="flex items-center gap-2">
                    <ChainIcon chainId={selectedTx.network} size="sm" />
                    <span className="font-medium text-foreground">
                      {SUPPORTED_CHAINS.find(c => c.id === selectedTx.network)?.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">时间</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedTx.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>

                {selectedTx.fee && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">网络费用</span>
                    <span className="font-medium text-foreground">${selectedTx.fee}</span>
                  </div>
                )}

                {selectedTx.txHash && (
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">交易哈希</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {selectedTx.txHash.slice(0, 8)}...{selectedTx.txHash.slice(-6)}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTx.txHash!);
                          toast.success('已复制到剪贴板');
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => setSelectedTx(null)}
              >
                关闭
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
