import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, ChevronRight, Send, QrCode, 
  TrendingDown, Wallet, Plus, Shield, ShieldAlert, AlertTriangle,
  CheckCircle2, Sparkles, Lock, ChevronDown, Clock, Bell, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainDropdown } from '@/components/ChainDropdown';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { TokenManager } from '@/components/TokenManager';
import { PullToRefresh } from '@/components/PullToRefresh';
import { WalletSwitcher } from '@/components/WalletSwitcher';
import { BalanceCardSkeleton, AssetListSkeleton, TransactionListSkeleton, RiskAlertSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';
import { AnimatedBalance } from '@/components/AnimatedNumber';

import { ChainId, SUPPORTED_CHAINS, Transaction } from '@/types/wallet';
import { TokenInfo } from '@/lib/tokens';
import { toast } from '@/lib/toast';
import { getChainShortName } from '@/lib/chain-utils';

// Empty state component when no wallet exists - guides user to create first wallet
function EmptyWalletState() {
  const navigate = useNavigate();

  return (
    <AppLayout showNav={false}>
      <div className="h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm w-full"
        >
          {/* Wallet icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-xl"
          >
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-xl font-bold text-foreground mb-2">
            开始创建您的钱包
          </h1>
          <p className="text-muted-foreground text-sm mb-1">
            只需 1 分钟完成安全设置
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            您的资产由多重签名技术保护，安全可靠
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-background"
            >
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">银行级安全</p>
                <p className="text-xs text-muted-foreground">MPC 多重签名保护</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-background"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">完全掌控</p>
                <p className="text-xs text-muted-foreground">只有您能控制资产</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-background"
            >
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-warning" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">可恢复</p>
                <p className="text-xs text-muted-foreground">换机丢机不丢资产</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full text-base gradient-primary"
              onClick={() => navigate('/onboarding')}
            >
              创建钱包
            </Button>
            <p className="text-xs text-muted-foreground">
              已有备份？
              <button 
                className="text-primary ml-1 hover:underline"
                onClick={() => navigate('/onboarding?recover=true')}
              >
                恢复钱包
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

// Helper to format balance with different sizes for integer and decimal parts
function formatBalanceParts(value: number) {
  const [integer, decimal] = value.toFixed(2).split('.');
  const formattedInteger = parseInt(integer).toLocaleString('en-US');
  return { integer: formattedInteger, decimal };
}

// Helper to mask email for privacy
function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
  return `${maskedName}@${domain}`;
}

export default function HomePage() {
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedChain, setSelectedChain] = useState<ChainId>('all');
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false);
  
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { assets, transactions, currentWallet, walletStatus, userInfo, addToken, removeToken, getAccountRiskStatus, unreadNotificationCount } = useWallet();
  
  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Get account risk status
  const riskStatus = getAccountRiskStatus();

  // Number of assets to show initially
  const INITIAL_ASSETS_COUNT = 5;

  // Get list of already added token symbols for each network
  const addedSymbols = useMemo(() => {
    return assets.map(a => a.symbol);
  }, [assets]);

  // Handle adding token to all supported networks
  const handleAddToken = (token: TokenInfo) => {
    token.networks.forEach(network => {
      addToken(token.symbol, token.name, network, token.price, token.change24h);
    });
    toast.success(`已添加 ${token.symbol} (${token.networks.length} 个网络)`);
  };

  // Handle removing token from all networks
  const handleRemoveToken = (symbol: string) => {
    removeToken(symbol);
    toast.success(`已删除 ${symbol}`);
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate API call to refresh balances
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('余额已刷新');
  }, []);

  // Filter and aggregate assets based on selected chain
  const displayAssets = useMemo(() => {
    if (selectedChain === 'all') {
      return aggregateAssets(assets);
    }
    // Filter assets for specific chain
    const chainAssets = assets.filter(a => a.network === selectedChain);
    return aggregateAssets(chainAssets);
  }, [assets, selectedChain]);

  // Calculate total balance based on selected chain
  const totalBalance = useMemo(() => {
    if (selectedChain === 'all') {
      return assets.reduce((sum, asset) => sum + asset.usdValue, 0);
    }
    return assets
      .filter(a => a.network === selectedChain)
      .reduce((sum, asset) => sum + asset.usdValue, 0);
  }, [assets, selectedChain]);

  // Filter transactions based on selected chain
  const filteredTransactions = useMemo(() => {
    let filtered = selectedChain === 'all' 
      ? transactions 
      : transactions.filter(tx => tx.network === selectedChain);
    // Sort by timestamp descending (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, selectedChain]);

  // Group transactions by date and limit to 5 items
  const groupedTransactions = useMemo(() => {
    const MAX_DISPLAY = 5;
    const displayTxs = filteredTransactions.slice(0, MAX_DISPLAY);
    
    const groups: { date: string; dateLabel: string; transactions: Transaction[] }[] = [];
    
    displayTxs.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateLabel: string;
      const dateKey = txDate.toDateString();
      
      if (txDate.toDateString() === today.toDateString()) {
        dateLabel = '今天';
      } else if (txDate.toDateString() === yesterday.toDateString()) {
        dateLabel = '昨天';
      } else {
        dateLabel = `${txDate.getMonth() + 1}月${txDate.getDate()}日`;
      }
      
      const existingGroup = groups.find(g => g.date === dateKey);
      if (existingGroup) {
        existingGroup.transactions.push(tx);
      } else {
        groups.push({ date: dateKey, dateLabel, transactions: [tx] });
      }
    });
    
    return groups;
  }, [filteredTransactions]);

  const hasMoreTransactions = filteredTransactions.length > 5;


  const balanceParts = formatBalanceParts(totalBalance);

  // Show empty state when no wallet exists
  if (walletStatus === 'not_created') {
    return <EmptyWalletState />;
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4">
        {/* Self-Custody Warning Banner */}
        {currentWallet?.isEscaped && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-warning-surface border border-warning/30 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">自托管钱包</p>
              <p className="text-xs text-muted-foreground">此钱包已脱离 MPC 保护，请妥善保管私钥</p>
            </div>
          </motion.div>
        )}

        {/* Header - Wallet Selector */}
        <div className="flex items-center justify-between mb-4">
          <motion.button 
            onClick={() => setShowWalletSwitcher(true)}
            className="flex items-center gap-3 rounded-xl p-1 -m-1 active:bg-muted/50 transition-colors"
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                currentWallet?.isEscaped 
                  ? "bg-warning/20" 
                  : "gradient-primary"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {currentWallet?.isEscaped ? (
                <Key className="w-5 h-5 text-warning" />
              ) : (
                <Wallet className="w-5 h-5 text-primary-foreground" />
              )}
            </motion.div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">当前钱包</p>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-foreground text-sm">
                  {currentWallet?.name || '我的钱包'}
                </p>
                {currentWallet?.isEscaped && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-warning/10 text-warning rounded ml-1">
                    自托管
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </motion.button>
          
          {/* Message Center Entry */}
          <motion.button 
            className="relative p-2 rounded-full active:bg-muted/50 transition-colors"
            onClick={() => navigate('/messages')}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadNotificationCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
              >
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Balance Card with Light Gradient Overlay */}
        {isLoading ? (
          <BalanceCardSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden card-elevated p-4 mb-4"
          >
            {/* Light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/8 pointer-events-none" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-radial from-success/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    {selectedChain === 'all' ? '总资产' : `${getChainShortName(selectedChain)} 资产`}
                  </span>
                  <button onClick={() => setHideBalance(!hideBalance)}>
                    {hideBalance ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <ChainDropdown
                  selectedChain={selectedChain}
                  onSelectChain={setSelectedChain}
                  addresses={currentWallet?.addresses}
                />
              </div>
              
              <div className="mb-4">
                <AnimatedBalance
                  integer={balanceParts.integer}
                  decimal={balanceParts.decimal}
                  hidden={hideBalance}
                  integerClassName="text-3xl font-bold text-foreground"
                  decimalClassName="text-lg font-medium text-foreground"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-10 gradient-accent text-accent-foreground"
                  onClick={() => navigate('/send')}
                >
                  <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  转账
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => navigate('/receive')}
                >
                  <QrCode className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  收款
                </Button>
              </div>
            </div>
          </motion.div>
        )}


        {/* Account Security Status */}
        {isLoading ? (
          <RiskAlertSkeleton />
        ) : riskStatus.status !== 'healthy' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/risk-management')}
            className={cn(
              "w-full p-3 rounded-xl border flex items-center gap-3 mb-4",
              riskStatus.status === 'restricted' 
                ? "bg-destructive/10 border-destructive/30" 
                : "bg-warning/10 border-warning/30"
            )}
          >
            {riskStatus.status === 'restricted' ? (
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            )}
            <div className="flex-1 text-left">
              <p className={cn(
                "text-sm font-medium",
                riskStatus.status === 'restricted' ? "text-destructive" : "text-warning"
              )}>
                {riskStatus.status === 'restricted' 
                  ? `存在 ${riskStatus.redCount} 笔高风险收款` 
                  : `存在 ${riskStatus.yellowCount} 笔可疑收款`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {riskStatus.status === 'restricted' ? '向服务商转账受限，请处置风险资金' : '点击查看详情'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>
        )}

        {/* Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground text-sm">资产</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-accent text-xs h-7 gap-1"
              onClick={() => setShowTokenSearch(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              添加代币
            </Button>
          </div>

          {isLoading ? (
            <AssetListSkeleton count={5} />
          ) : displayAssets.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="暂无资产"
              description="添加代币开始管理您的资产"
              action={{
                label: '添加代币',
                icon: Plus,
                onClick: () => setShowTokenSearch(true),
              }}
            />
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {(showAllAssets ? displayAssets : displayAssets.slice(0, INITIAL_ASSETS_COUNT)).map((asset, index) => (
                  <motion.button
                    key={asset.symbol}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => navigate(`/asset/${asset.symbol}`)}
                    className="w-full card-elevated p-3 flex items-center justify-between hover:bg-muted/30 active:scale-[0.98] active:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={asset.symbol} size="md" />
                      <div className="text-left">
                        <p className="font-medium text-foreground text-sm">{asset.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.name}
                          {selectedChain === 'all' && asset.chains.length > 1 && (
                            <span className="ml-1 text-accent">· {asset.chains.length} 链</span>
                          )}
                        </p>
                      </div>
                    </div>
                      <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {hideBalance ? '****' : asset.totalBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hideBalance ? '**' : `$${asset.totalUsdValue.toLocaleString()}`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
              
              {/* Show more / Show less button */}
              {displayAssets.length > INITIAL_ASSETS_COUNT && (
                <motion.button
                  layout
                  onClick={() => setShowAllAssets(!showAllAssets)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/30"
                >
                  <motion.div
                    animate={{ rotate: showAllAssets ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  {showAllAssets ? '收起' : '展开全部'}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground text-sm">最近交易</h2>
          </div>

          {isLoading ? (
            <TransactionListSkeleton count={5} showDateHeader={true} />
          ) : groupedTransactions.length === 0 ? (
            <EmptyState
              icon={Send}
              title="暂无交易记录"
              description="您的交易记录将在此显示"
            />
          ) : (
            <div className="space-y-3">
              {groupedTransactions.map((group) => (
                <div key={group.date}>
                  {/* Date Header */}
                  <p className="text-xs text-muted-foreground mb-1.5 px-1">
                    {group.dateLabel}
                  </p>
                  <div className="space-y-1.5">
                    {group.transactions.map((tx, index) => (
                      <motion.button
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        onClick={() => navigate(`/transaction/${tx.id}`)}
                        className="w-full card-elevated p-3 flex items-center justify-between text-left hover:bg-muted/30 active:scale-[0.98] active:bg-muted/50 transition-all"
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
                            <p className="font-medium text-foreground text-sm">
                              {tx.type === 'receive' ? '转入' : '转出'}
                            </p>
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
                    ))}
                  </div>
                </div>
              ))}
              
              {/* View All Button - positioned below the list */}
              {hasMoreTransactions && (
                <motion.button
                  onClick={() => navigate('/history')}
                  className="w-full py-3 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/30"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </div>
      </PullToRefresh>

      {/* Token Search Modal */}
      <AnimatePresence>
        {showTokenSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background"
          >
            <TokenManager
              addedSymbols={addedSymbols}
              addedAssets={assets}
              onAddToken={handleAddToken}
              onRemoveToken={handleRemoveToken}
              onClose={() => setShowTokenSearch(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Switcher */}
      <WalletSwitcher
        isOpen={showWalletSwitcher}
        onClose={() => setShowWalletSwitcher(false)}
        onCreateNew={() => {
          setShowWalletSwitcher(false);
          navigate('/create-wallet');
        }}
      />

    </AppLayout>
  );
}
