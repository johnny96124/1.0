import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldAlert, AlertTriangle, CheckCircle2,
  ChevronRight, RotateCcw, Eye, Copy, ExternalLink, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn, formatAddressShort } from '@/lib/utils';
import { CryptoIcon } from '@/components/CryptoIcon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Transaction, AccountRiskStatus } from '@/types/wallet';
import { format } from 'date-fns';
import { toast } from '@/lib/toast';
import { PullToRefresh } from '@/components/PullToRefresh';

type TabValue = 'all' | 'red' | 'yellow' | 'handled';

// Helper to get status config
const getStatusConfig = (status: AccountRiskStatus) => {
  switch (status) {
    case 'healthy':
      return {
        icon: Shield,
        label: '账户安全',
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        label: '存在可疑收款',
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
      };
    case 'restricted':
      return {
        icon: ShieldAlert,
        label: '向服务商转账受限',
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
      };
  }
};

// Helper to get risk score config
const getRiskConfig = (score: 'yellow' | 'red') => {
  if (score === 'red') {
    return {
      label: '高风险',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
    };
  }
  return {
    label: '可疑',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  };
};

// Helper to format address
const formatAddress = (address: string, showFull = false) => {
  if (showFull || address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

export default function RiskManagement() {
  const navigate = useNavigate();
  const { getAccountRiskStatus, getRiskTransactions, acknowledgeRiskTx } = useWallet();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  const riskStatus = getAccountRiskStatus();
  const statusConfig = getStatusConfig(riskStatus.status);
  const StatusIcon = statusConfig.icon;
  
  const riskTransactions = getRiskTransactions();
  
  // Filter transactions based on tab
  const filteredTransactions = useMemo(() => {
    switch (activeTab) {
      case 'red':
        return riskTransactions.filter(tx => tx.riskScore === 'red' && tx.disposalStatus === 'pending');
      case 'yellow':
        return riskTransactions.filter(tx => tx.riskScore === 'yellow' && tx.disposalStatus === 'pending');
      case 'handled':
        return riskTransactions.filter(tx => tx.disposalStatus !== 'pending');
      default:
        return riskTransactions;
    }
  }, [riskTransactions, activeTab]);
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('已复制', formatAddressShort(address));
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
  
  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate API call to refresh risk transactions
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('已刷新', '风险交易列表已更新');
  }, []);
  
  return (
    <AppLayout showNav={false} title="风险资金处置" titleBadge={riskStatus.pendingRiskCount} showBack>
        <PullToRefresh onRefresh={handleRefresh} className="flex-1">
          <div className="px-4 py-4">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={cn(
              "p-4 rounded-xl border",
              statusConfig.bg,
              statusConfig.border
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", statusConfig.bg)}>
                  <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", statusConfig.color)}>{statusConfig.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {riskStatus.pendingRiskCount > 0 
                      ? `${riskStatus.pendingRiskCount} 笔待处置交易`
                      : '暂无风险收款'
                    }
                  </p>
                </div>
              </div>
              
              {riskStatus.pendingRiskCount > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/30">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      ${riskStatus.totalRiskExposure.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">风险敞口</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {riskStatus.redCount > 0 && (
                        <span className="text-destructive font-medium">{riskStatus.redCount} 高风险</span>
                      )}
                      {riskStatus.yellowCount > 0 && (
                        <span className="text-warning font-medium">{riskStatus.yellowCount} 可疑</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">待处置</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Empty State - When no risk transactions at all */}
          {riskTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Shield className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">账户安全无风险</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                当前没有检测到任何可疑或高风险的入款交易，您的账户状态良好。
              </p>
              <p className="text-xs text-muted-foreground/60 mt-4">
                系统会持续监控入款交易的风险状态
              </p>
            </motion.div>
          ) : (
            <>
              {/* Tabs - Underline style for secondary filters */}
              <div className="mt-4 border-b border-border">
                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'red', label: '高风险' },
                    { value: 'yellow', label: '可疑' },
                    { value: 'handled', label: '已处置' },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value as TabValue)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                        activeTab === tab.value
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.value && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Transaction List */}
              <div className="mt-4 pb-2">
                {filteredTransactions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {activeTab === 'handled' ? '暂无已处置交易' : '暂无风险交易'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filteredTransactions.map((tx, index) => {
                        const riskConfig = tx.riskScore === 'red' || tx.riskScore === 'yellow' 
                          ? getRiskConfig(tx.riskScore) 
                          : null;
                        const isHandled = tx.disposalStatus !== 'pending';
                        
                        return (
                          <motion.button
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: 0.03 * index }}
                            onClick={() => setSelectedTx(tx)}
                            className={cn(
                              "w-full p-3 rounded-xl border text-left transition-colors",
                              isHandled 
                                ? "bg-muted/30 border-border/50" 
                                : "bg-card border-border hover:bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <CryptoIcon symbol={tx.symbol} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={cn(
                                    "font-medium text-sm",
                                    isHandled ? "text-muted-foreground" : "text-foreground"
                                  )}>
                                    +{tx.amount.toLocaleString()} {tx.symbol}
                                  </p>
                                  {riskConfig && !isHandled && (
                                    <span className={cn(
                                      "text-xs px-1.5 py-0.5 rounded",
                                      riskConfig.bg,
                                      riskConfig.color
                                    )}>
                                      {riskConfig.label}
                                    </span>
                                  )}
                                  {isHandled && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                      {tx.disposalStatus === 'returned' ? '已退回' : '已知晓'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                  {formatAddress(tx.counterparty)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span className="text-xs">
                                  {format(tx.timestamp, 'MM/dd HH:mm')}
                                </span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          )}
          </div>
        </PullToRefresh>
      
      {/* Transaction Detail Drawer */}
      <Drawer open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border/50">
            <DrawerTitle>交易详情</DrawerTitle>
          </DrawerHeader>
          
          {selectedTx && (
            <div className="px-4 py-4 overflow-y-auto">
              {/* Amount */}
              <div className="flex items-center gap-3 mb-4">
                <CryptoIcon symbol={selectedTx.symbol} size="lg" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    +{selectedTx.amount.toLocaleString()} {selectedTx.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${selectedTx.usdValue.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Risk Badge */}
              {(selectedTx.riskScore === 'red' || selectedTx.riskScore === 'yellow') && (
                <div className={cn(
                  "p-3 rounded-xl border mb-4",
                  selectedTx.riskScore === 'red' 
                    ? "bg-destructive/10 border-destructive/30" 
                    : "bg-warning/10 border-warning/30"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedTx.riskScore === 'red' ? (
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span className={cn(
                      "font-medium text-sm",
                      selectedTx.riskScore === 'red' ? "text-destructive" : "text-warning"
                    )}>
                      {selectedTx.riskScore === 'red' ? '高风险来款' : '可疑来款'}
                    </span>
                    {selectedTx.disposalStatus !== 'pending' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto">
                        {selectedTx.disposalStatus === 'returned' ? '已退回' : '已知晓'}
                      </span>
                    )}
                  </div>
                  
                  {selectedTx.riskReasons && selectedTx.riskReasons.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {selectedTx.riskReasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-muted-foreground/50">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {selectedTx.riskScanTime && (
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      KYT 扫描时间: {format(selectedTx.riskScanTime, 'yyyy-MM-dd HH:mm')}
                    </p>
                  )}
                </div>
              )}
              
              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">来源地址</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground">
                      {formatAddress(selectedTx.counterparty)}
                    </span>
                    <button 
                      onClick={() => handleCopyAddress(selectedTx.counterparty)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">网络</span>
                  <span className="text-sm text-foreground">{selectedTx.network}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">收款时间</span>
                  <span className="text-sm text-foreground">
                    {format(selectedTx.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">交易哈希</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground">
                      {formatAddress(selectedTx.txHash)}
                    </span>
                    <button className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {selectedTx.disposalStatus === 'returned' && selectedTx.disposalTxHash && (
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">退回交易</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-foreground">
                        {formatAddress(selectedTx.disposalTxHash)}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              {selectedTx.disposalStatus === 'pending' && (
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleReturn(selectedTx.id)}
                  >
                    退回资金
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAcknowledge(selectedTx.id)}
                  >
                    我已知晓风险
                  </Button>
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
