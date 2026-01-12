import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Send, TrendingDown, 
  CheckCircle2, AlertCircle, XCircle,
  ExternalLink, Copy, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types/wallet';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { transactions } = useWallet();

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.counterparty.toLowerCase().includes(query) ||
        tx.counterpartyLabel?.toLowerCase().includes(query) ||
        tx.txHash.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

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
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">交易记录</h1>

        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索交易..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
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

        {/* Transaction Detail Modal */}
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-auto bg-card rounded-t-2xl p-6"
            >
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
              
              <div className="text-center mb-6">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                  selectedTx.type === 'receive' ? 'bg-success/10' : 'bg-accent/10'
                )}>
                  {selectedTx.type === 'receive' ? (
                    <TrendingDown className="w-8 h-8 text-success rotate-180" />
                  ) : (
                    <Send className="w-8 h-8 text-accent" />
                  )}
                </div>
                <p className={cn(
                  'text-2xl font-bold',
                  selectedTx.type === 'receive' ? 'text-success' : 'text-foreground'
                )}>
                  {selectedTx.type === 'receive' ? '+' : '-'}{selectedTx.amount} {selectedTx.symbol}
                </p>
                <p className="text-muted-foreground">
                  ${selectedTx.usdValue.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">状态</span>
                  <span className="flex items-center gap-1 font-medium">
                    {getStatusIcon(selectedTx.status)}
                    {getStatusText(selectedTx.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {selectedTx.type === 'receive' ? '付款方' : '收款方'}
                  </span>
                  <span className="font-medium font-mono text-sm">
                    {selectedTx.counterparty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">网络</span>
                  <span className="font-medium">{selectedTx.network}</span>
                </div>
                {selectedTx.fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">网络费用</span>
                    <span className="font-medium">${selectedTx.fee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">时间</span>
                  <span className="font-medium">
                    {new Date(selectedTx.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">交易哈希</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {selectedTx.txHash.slice(0, 8)}...{selectedTx.txHash.slice(-6)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
      </div>
    </AppLayout>
  );
}
