import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Send, TrendingDown, 
  CheckCircle2, XCircle,
  ExternalLink, Copy, ChevronRight, Clock,
  Shield, ShieldAlert, AlertTriangle, RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { Transaction, SUPPORTED_CHAINS, ChainId, AccountRiskStatus } from '@/types/wallet';
import { PullToRefresh } from '@/components/PullToRefresh';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { toast } from '@/lib/toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityCardSkeleton, TransactionListSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RbfActionSection } from '@/components/RbfActionSection';
import { SpeedUpDrawer } from '@/components/SpeedUpDrawer';
import { CancelTxDrawer } from '@/components/CancelTxDrawer';
import { canSpeedUp, SpeedUpTier } from '@/lib/rbf-utils';

type FilterType = 'all' | 'send' | 'receive' | 'risk';

// Helper to get status config
const getStatusConfig = (status: AccountRiskStatus) => {
  switch (status) {
    case 'healthy':
      return {
        icon: Shield,
        label: '账户安全',
        sublabel: '无待处置风险交易',
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        label: '存在可疑收款',
        sublabel: '建议尽快处置',
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
      };
    case 'restricted':
      return {
        icon: ShieldAlert,
        label: '向服务商转账受限',
        sublabel: '需处置高风险资金',
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
      };
  }
};

// Helper to get risk score config
const getRiskConfig = (score: 'yellow' | 'red' | 'green') => {
  if (score === 'red') {
    return {
      label: '高风险',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    };
  }
  if (score === 'yellow') {
    return {
      label: '可疑',
      color: 'text-warning',
      bg: 'bg-warning/10',
    };
  }
  return null;
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [chainFilter, setChainFilter] = useState<ChainId>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [speedUpDrawerOpen, setSpeedUpDrawerOpen] = useState(false);
  const [cancelDrawerOpen, setCancelDrawerOpen] = useState(false);
  const { transactions, getAccountRiskStatus, acknowledgeRiskTx } = useWallet();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Get account risk status
  const riskStatus = getAccountRiskStatus();
  const statusConfig = getStatusConfig(riskStatus.status);
  const StatusIcon = statusConfig.icon;

  // Count risk transactions
  const riskCount = useMemo(() => {
    return transactions.filter(tx => 
      tx.type === 'receive' && 
      (tx.riskScore === 'red' || tx.riskScore === 'yellow') && 
      tx.disposalStatus === 'pending'
    ).length;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filter by chain
      if (chainFilter !== 'all' && tx.network !== chainFilter) return false;
      
      // Filter by type
      if (filter === 'send' && tx.type !== 'send') return false;
      if (filter === 'receive' && tx.type !== 'receive') return false;
      if (filter === 'risk') {
        if (tx.type !== 'receive') return false;
        if (tx.riskScore !== 'red' && tx.riskScore !== 'yellow') return false;
        if (tx.disposalStatus !== 'pending') return false;
      }
      
      // Search filter
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
  }, [transactions, filter, chainFilter, searchQuery]);

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
    toast.success('已刷新', '交易记录已更新');
  }, []);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const handleAcknowledge = (txId: string) => {
    acknowledgeRiskTx(txId);
    setSelectedTx(null);
    toast.success('已标记为已知晓', '该交易已从待处置列表中移除');
  };

  const handleReturn = (txId: string) => {
    setSelectedTx(null);
    navigate(`/risk-management/return/${txId}`);
  };

  // RBF handlers
  const handleSpeedUpClick = () => {
    setSpeedUpDrawerOpen(true);
  };

  const handleCancelClick = () => {
    setCancelDrawerOpen(true);
  };

  const handleSpeedUpConfirm = (tier: SpeedUpTier, newFee: number, newGasAmount: number) => {
    setSpeedUpDrawerOpen(false);
    // In a real app, this would call the blockchain API to submit the replacement tx
    toast.success('加速请求已提交', '新交易正在广播中');
    setSelectedTx(null);
  };

  const handleCancelConfirm = (cancelFee: number, cancelGasAmount: number) => {
    setCancelDrawerOpen(false);
    // In a real app, this would call the blockchain API to submit the cancellation tx
    toast.success('取消请求已提交', '原交易将被替换');
    setSelectedTx(null);
  };

  // Check if transaction is a pending risk transaction
  const isRiskTx = (tx: Transaction) => {
    return tx.type === 'receive' && 
           (tx.riskScore === 'red' || tx.riskScore === 'yellow') && 
           tx.disposalStatus === 'pending';
  };

  return (
    <AppLayout title="交易与安全" titleBadge={riskCount}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4">

          {/* Account Security Status Card - Clickable when there are pending risks */}
          {isLoading ? (
            <SecurityCardSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={riskStatus.pendingRiskCount > 0 ? { scale: 0.98 } : undefined}
              onClick={() => riskStatus.pendingRiskCount > 0 && navigate('/risk-management')}
              className={cn(
                "p-4 rounded-xl border mb-4 transition-colors",
                statusConfig.bg,
                statusConfig.border,
                riskStatus.pendingRiskCount > 0 && "cursor-pointer active:opacity-90"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", statusConfig.bg)}>
                  <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", statusConfig.color)}>{statusConfig.label}</p>
                  <p className="text-xs text-muted-foreground">{statusConfig.sublabel}</p>
                </div>
                {riskStatus.pendingRiskCount > 0 && (
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">{riskStatus.pendingRiskCount}</p>
                      <p className="text-xs text-muted-foreground">待处置</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {riskStatus.pendingRiskCount > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                  {riskStatus.redCount > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                      {riskStatus.redCount} 高风险
                    </span>
                  )}
                  {riskStatus.yellowCount > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                      {riskStatus.yellowCount} 可疑
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    风险敞口 ${riskStatus.totalRiskExposure.toLocaleString()}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {isLoading ? (
            <TransactionListSkeleton count={5} showSearchBar showTabs />
          ) : (
            <>
              {/* Search + Chain Filter */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索交易..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
                
                {/* Chain Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-3 gap-1.5 shrink-0"
                    >
                      <ChainIcon chainId={chainFilter} size="sm" />
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-popover border border-border shadow-xl z-50 max-h-[60vh] overflow-y-auto"
                    container={document.getElementById('phone-frame-container') || undefined}
                  >
                    {SUPPORTED_CHAINS.map((chain) => {
                      const isSelected = chainFilter === chain.id;
                      return (
                        <DropdownMenuItem
                          key={chain.id}
                          onClick={() => setChainFilter(chain.id)}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50",
                            isSelected && "bg-muted/50"
                          )}
                        >
                          <ChainIcon chainId={chain.icon} size="md" className="shrink-0" />
                          <span className="font-medium text-sm text-foreground">
                            {chain.name}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filter Tabs - Underline style for secondary filters */}
              <div className="border-b border-border mb-4">
                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'send', label: '转出' },
                    { value: 'receive', label: '收入' },
                    { value: 'risk', label: '风险', badge: riskCount },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value as FilterType)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative flex items-center gap-1.5",
                        filter === tab.value
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                      {tab.badge && tab.badge > 0 && (
                        <span className="min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full inline-flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                      {filter === tab.value && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Transactions List */}
          {!isLoading && (
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
                  <div className="space-y-1.5">
                    {txs.map((tx, index) => {
                      const riskConfig = tx.riskScore && tx.riskScore !== 'green' 
                        ? getRiskConfig(tx.riskScore) 
                        : null;
                      const isPendingRisk = isRiskTx(tx);
                      
                      return (
                        <motion.button
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          onClick={() => setSelectedTx(tx)}
                        className={cn(
                          "w-full p-3 rounded-xl flex items-center justify-between text-left transition-all",
                          "hover:bg-muted/30 active:scale-[0.98] active:bg-muted/50",
                          isPendingRisk && tx.riskScore === 'red' 
                            ? "bg-destructive/5 border border-destructive/30" 
                            : isPendingRisk && tx.riskScore === 'yellow'
                            ? "bg-warning/5 border border-warning/30"
                            : "bg-card border border-border/50"
                        )}
                      >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              tx.type === 'receive' ? 'bg-success/10' : 'bg-accent/10'
                            )}>
                              {tx.type === 'receive' ? (
                                <TrendingDown className="w-4 h-4 text-success rotate-180" />
                              ) : (
                                <Send className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-foreground text-sm">
                                  {tx.type === 'receive' ? '转入' : '转出'}
                                </p>
                                {riskConfig && isPendingRisk && (
                                  <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded",
                                    riskConfig.bg,
                                    riskConfig.color
                                  )}>
                                    {riskConfig.label}
                                  </span>
                                )}
                                {tx.disposalStatus === 'returned' && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    已退回
                                  </span>
                                )}
                                {tx.disposalStatus === 'acknowledged' && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    已知晓
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                  {tx.counterpartyLabel || `${tx.counterparty.slice(0, 6)}...${tx.counterparty.slice(-4)}`}
                                </span>
                                <span className="text-xs text-muted-foreground/60">·</span>
                                <span className="text-xs text-muted-foreground">
                                  {SUPPORTED_CHAINS.find(c => c.id === tx.network)?.shortName || tx.network}
                                </span>
                                {tx.status === 'pending' && (
                                  <span className="text-xs text-warning flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                  </span>
                                )}
                                {tx.status === 'confirmed' && (
                                  <span className="text-xs text-success flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </span>
                                )}
                                {tx.status === 'failed' && (
                                  <span className="text-xs text-destructive flex items-center gap-0.5">
                                    <XCircle className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div>
                              <p className={cn(
                                'font-medium text-sm',
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
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {filteredTransactions.length === 0 && (
                <EmptyState
                  icon={filter === 'risk' ? Shield : Send}
                  title={filter === 'risk' ? '暂无待处置风险交易' : '暂无交易记录'}
                  description={filter === 'risk' ? '账户安全状态良好' : undefined}
                  variant={filter === 'risk' ? 'success' : 'default'}
                />
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Transaction Detail Drawer */}
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
              className="w-full bg-card rounded-t-2xl p-6 pb-8"
            >
              {/* Drawer Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-muted rounded-full" />
              </div>

              {/* Hero Section: Token Icon + Amount */}
              <div className="relative mb-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center shadow-lg">
                      <CryptoIcon symbol={selectedTx.symbol} size="xl" />
                    </div>
                    {/* Always show chain icon badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-card bg-card">
                      <ChainIcon chainId={selectedTx.network} size="sm" />
                    </div>
                  </div>
                </div>

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

                {/* Status Tags */}
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                    selectedTx.status === 'confirmed' && "bg-success/10 text-success",
                    selectedTx.status === 'pending' && "bg-warning/10 text-warning",
                    selectedTx.status === 'failed' && "bg-destructive/10 text-destructive"
                  )}>
                    {selectedTx.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {selectedTx.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {selectedTx.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                    {selectedTx.type === 'receive' ? '收款' : '转账'}
                    {selectedTx.status === 'confirmed' && '已完成'}
                    {selectedTx.status === 'pending' && '处理中'}
                    {selectedTx.status === 'failed' && '失败'}
                  </span>
                  
                  {isRiskTx(selectedTx) && selectedTx.riskScore && (
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                      selectedTx.riskScore === 'red' && "bg-destructive/10 text-destructive",
                      selectedTx.riskScore === 'yellow' && "bg-warning/10 text-warning"
                    )}>
                      {selectedTx.riskScore === 'red' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {selectedTx.riskScore === 'yellow' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {selectedTx.riskScore === 'red' ? '高风险' : '可疑'}
                    </span>
                  )}
                </div>
              </div>

              {/* Risk Info Section */}
              {isRiskTx(selectedTx) && selectedTx.riskReasons && (
                <div className={cn(
                  "p-3 rounded-xl border mb-4",
                  selectedTx.riskScore === 'red' 
                    ? "bg-destructive/10 border-destructive/30" 
                    : "bg-warning/10 border-warning/30"
                )}>
                  <p className="text-sm font-medium text-foreground mb-2">风险原因</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedTx.riskReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-muted-foreground/50">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Details */}
              <div className="space-y-0">
                <div className="flex justify-between items-center py-3 border-b border-border">
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

                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">网络</span>
                  <div className="flex items-center gap-1.5">
                    <ChainIcon chainId={selectedTx.network} size="sm" />
                    <span className="font-medium text-foreground">
                      {SUPPORTED_CHAINS.find(c => c.id === selectedTx.network)?.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">时间</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedTx.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>

                {selectedTx.fee && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">网络费用</span>
                    <span className="font-medium text-foreground">${selectedTx.fee}</span>
                  </div>
                )}

                {selectedTx.txHash && (
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">交易哈希</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground font-mono">
                        {selectedTx.txHash.slice(0, 8)}...{selectedTx.txHash.slice(-6)}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTx.txHash!);
                          setCopiedHash(true);
                          toast.success('已复制到剪贴板');
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="p-1.5 hover:bg-muted rounded"
                      >
                        {copiedHash ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RBF Action Section - for pending send transactions */}
              {selectedTx.status === 'pending' && selectedTx.type === 'send' && !isRiskTx(selectedTx) && (
                <div className="mt-4">
                  <RbfActionSection
                    transaction={selectedTx}
                    onSpeedUp={handleSpeedUpClick}
                    onCancel={handleCancelClick}
                  />
                </div>
              )}

              {/* Actions */}
              {isRiskTx(selectedTx) ? (
                <div className="space-y-2 mt-4">
                  <Button
                    variant="destructive"
                    className="w-full gap-2 h-10"
                    onClick={() => handleReturn(selectedTx.id)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    退回资金
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => handleAcknowledge(selectedTx.id)}
                  >
                    我已知晓风险，保留资金
                  </Button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RBF Drawers */}
      {selectedTx && (
        <>
          <SpeedUpDrawer
            open={speedUpDrawerOpen}
            onOpenChange={setSpeedUpDrawerOpen}
            transaction={selectedTx}
            onConfirm={handleSpeedUpConfirm}
          />
          <CancelTxDrawer
            open={cancelDrawerOpen}
            onOpenChange={setCancelDrawerOpen}
            transaction={selectedTx}
            onConfirm={handleCancelConfirm}
          />
        </>
      )}
    </AppLayout>
  );
}
