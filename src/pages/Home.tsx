import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, ChevronRight, Send, QrCode, 
  TrendingUp, TrendingDown, Wallet, Plus, Shield,
  CheckCircle2, AlertCircle, Sparkles, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainSelector } from '@/components/ChainSelector';
import { AddressDisplay } from '@/components/AddressDisplay';
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';

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

export default function HomePage() {
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedChain, setSelectedChain] = useState<ChainId>('all');
  const navigate = useNavigate();
  const { assets, transactions, currentWallet, walletStatus, backupStatus } = useWallet();

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

  // Get current address for selected chain
  const currentAddress = useMemo(() => {
    if (!currentWallet?.addresses) return null;
    if (selectedChain === 'all') return currentWallet.addresses.ethereum;
    return currentWallet.addresses[selectedChain];
  }, [currentWallet, selectedChain]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getChainName = (chainId: ChainId) => {
    return SUPPORTED_CHAINS.find(c => c.id === chainId)?.shortName || chainId;
  };

  return (
    <AppLayout>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">当前钱包</p>
              <p className="font-semibold text-foreground">{currentWallet?.name || '主钱包'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-accent"
              onClick={() => navigate('/create-wallet')}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile/wallets')}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Address Display */}
        {currentAddress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <AddressDisplay 
              address={currentAddress} 
              label={selectedChain !== 'all' ? getChainName(selectedChain) : undefined}
            />
          </motion.div>
        )}

        {/* Chain Selector */}
        <ChainSelector
          selectedChain={selectedChain}
          onSelectChain={setSelectedChain}
          className="mb-4"
        />

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
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
          
          <motion.p
            key={`${hideBalance}-${selectedChain}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-foreground mb-4"
          >
            {hideBalance ? '****.**' : formatCurrency(totalBalance)}
          </motion.p>

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
        </motion.div>

        {/* Security Score Card */}
        {walletStatus !== 'fully_secure' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-3 mb-4 border-warning/30 bg-warning/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">完善安全设置</p>
                <p className="text-xs text-muted-foreground truncate">
                  完成备份以解锁全部转账功能
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-warning shrink-0"
                onClick={() => navigate('/onboarding')}
              >
                去完成
              </Button>
            </div>
          </motion.div>
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
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7">
              管理
            </Button>
          </div>

          <div className="space-y-1.5">
            {displayAssets.map((asset, index) => (
              <motion.button
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => navigate(`/asset/${asset.symbol}`)}
                className="w-full card-elevated p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                    {asset.icon}
                  </div>
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
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-muted-foreground">
                        {hideBalance ? '**' : formatCurrency(asset.totalUsdValue)}
                      </span>
                      {asset.change24h !== 0 && (
                        <span className={cn(
                          'text-xs flex items-center',
                          asset.change24h > 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {asset.change24h > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(asset.change24h)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
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

          <div className="space-y-1.5">
            {filteredTransactions.slice(0, 3).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-elevated p-3 flex items-center justify-between"
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
                          已完成
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-medium text-sm',
                    tx.type === 'receive' ? 'text-success' : 'text-foreground'
                  )}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="card-elevated p-6 text-center">
              <p className="text-muted-foreground text-sm">暂无交易记录</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedChain === 'all' 
                  ? '分享收款地址给付款方开始收款'
                  : `暂无 ${getChainName(selectedChain)} 链上的交易`
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
