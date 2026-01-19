import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, ChevronRight, Send, QrCode, 
  TrendingDown, Wallet, Plus, Shield,
  CheckCircle2, AlertCircle, Sparkles, Lock, Settings, ChevronDown, Clock, XCircle, Copy, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainDropdown } from '@/components/ChainDropdown';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { TokenSearch } from '@/components/TokenSearch';
import { PullToRefresh } from '@/components/PullToRefresh';
import { WalletSwitcher } from '@/components/WalletSwitcher';
import { PSPQuickEntry } from '@/components/PSPQuickEntry';
import { ChainId, SUPPORTED_CHAINS, Transaction } from '@/types/wallet';
import { TokenInfo } from '@/lib/tokens';
import { toast } from 'sonner';

// Empty state component when no wallet exists - guides user to create first wallet
function EmptyWalletState() {
  const navigate = useNavigate();

  return (
    <AppLayout showNav={false}>
      <div className="h-full flex flex-col items-center justify-center px-6">
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
              className="w-full h-12 text-base gradient-primary"
              onClick={() => navigate('/onboarding')}
            >
              <Plus className="w-5 h-5 mr-2" />
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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const navigate = useNavigate();
  const { assets, transactions, currentWallet, walletStatus, userInfo, addToken } = useWallet();

  // Number of assets to show initially
  const INITIAL_ASSETS_COUNT = 5;

  // Get list of already added token symbols for each network
  const addedSymbols = useMemo(() => {
    return assets.map(a => a.symbol);
  }, [assets]);

  const handleAddToken = (token: TokenInfo, network: ChainId) => {
    addToken(token.symbol, token.name, network, token.price, token.change24h);
    toast.success(`已添加 ${token.symbol} (${network})`);
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    // Simulate API call to refresh balances
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('余额已刷新');
  }, []);

  // Show empty state when no wallet exists
  if (walletStatus === 'not_created') {
    return <EmptyWalletState />;
  }

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
    if (selectedChain === 'all') return transactions;
    return transactions.filter(tx => tx.network === selectedChain);
  }, [transactions, selectedChain]);

  const getChainName = (chainId: ChainId) => {
    return SUPPORTED_CHAINS.find(c => c.id === chainId)?.shortName || chainId;
  };

  const balanceParts = formatBalanceParts(totalBalance);

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4">
        {/* Header - Wallet Selector */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setShowWalletSwitcher(true)}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">当前钱包</p>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-foreground text-sm">
                  {currentWallet?.name || '我的钱包'}
                </p>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Balance Card with Light Gradient Overlay */}
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
                  {selectedChain === 'all' ? '总资产' : `${getChainName(selectedChain)} 资产`}
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
            
            <motion.div
              key={`${hideBalance}-${selectedChain}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-baseline gap-0.5 mb-4"
            >
              {hideBalance ? (
                <span className="text-3xl font-bold text-foreground">****.**</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-foreground">${balanceParts.integer}</span>
                  <span className="text-lg font-medium text-muted-foreground">.{balanceParts.decimal}</span>
                </>
              )}
            </motion.div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 h-10 gradient-accent text-accent-foreground"
                onClick={() => navigate('/send')}
              >
                <Send className="w-4 h-4 mr-2" />
                转账
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => navigate('/receive')}
              >
                <QrCode className="w-4 h-4 mr-2" />
                收款
              </Button>
            </div>
          </div>
        </motion.div>

        {/* PSP Quick Entry */}
        <PSPQuickEntry />

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

          {displayAssets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-elevated p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">暂无资产</p>
              <p className="text-xs text-muted-foreground/70 mb-3">添加代币开始管理您的资产</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setShowTokenSearch(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                添加代币
              </Button>
            </motion.div>
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
                    className="w-full card-elevated p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
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
                  {showAllAssets 
                    ? '收起' 
                    : `展开更多 (${displayAssets.length - INITIAL_ASSETS_COUNT} 个)`
                  }
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground text-xs h-7"
              onClick={() => navigate('/history')}
            >
              查看全部
            </Button>
          </div>

          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-elevated p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Send className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">暂无交易记录</p>
              <p className="text-xs text-muted-foreground/70">您的交易记录将在此显示</p>
            </motion.div>
          ) : (
            <div className="space-y-1.5">
              {filteredTransactions.slice(0, 3).map((tx, index) => (
                <motion.button
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full card-elevated p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
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
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {tx.counterpartyLabel || tx.counterparty}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground/60">·</span>
                        <span className="text-xs text-muted-foreground">
                          {SUPPORTED_CHAINS.find(c => c.id === tx.network)?.shortName || tx.network}
                        </span>
                        {tx.status === 'pending' && (
                          <span className="text-xs text-warning flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />
                            处理中
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
            <TokenSearch
              addedSymbols={addedSymbols}
              onAddToken={handleAddToken}
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
