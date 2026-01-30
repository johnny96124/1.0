import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Send, QrCode, TrendingDown, 
  CheckCircle2, AlertCircle, ChevronRight, Clock, XCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainSelector } from '@/components/ChainSelector';
import { AddressDisplay } from '@/components/AddressDisplay';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { TransactionListSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';
import { SwipeBack } from '@/components/SwipeBack';
import { ChainSelectDrawer } from '@/components/ChainSelectDrawer';
import { ChainId, SUPPORTED_CHAINS, Transaction } from '@/types/wallet';
import { toast } from '@/lib/toast';

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedChain, setSelectedChain] = useState<ChainId>('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [showChainSelectDrawer, setShowChainSelectDrawer] = useState(false);
  const [pendingAction, setPendingAction] = useState<'send' | 'receive' | null>(null);
  const { assets, transactions, currentWallet } = useWallet();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Get aggregated asset data
  const aggregatedAssets = useMemo(() => aggregateAssets(assets), [assets]);
  const assetData = useMemo(() => 
    aggregatedAssets.find(a => a.symbol === symbol), 
    [aggregatedAssets, symbol]
  );

  // Filter by selected chain
  const displayBalance = useMemo(() => {
    if (!assetData) return { balance: 0, usdValue: 0 };
    if (selectedChain === 'all') {
      return { balance: assetData.totalBalance, usdValue: assetData.totalUsdValue };
    }
    const chainData = assetData.chains.find(c => c.network === selectedChain);
    return chainData || { balance: 0, usdValue: 0 };
  }, [assetData, selectedChain]);

  // Filter transactions for this asset
  const assetTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => tx.symbol === symbol);
    if (selectedChain !== 'all') {
      filtered = filtered.filter(tx => tx.network === selectedChain);
    }
    return filtered;
  }, [transactions, symbol, selectedChain]);

  // Get address for selected chain
  const currentAddress = useMemo(() => {
    if (!currentWallet?.addresses) return null;
    if (selectedChain === 'all') return null;
    return currentWallet.addresses[selectedChain];
  }, [currentWallet, selectedChain]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
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


  if (!assetData) {
    return (
      <AppLayout showNav={false}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">资产不存在</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <SwipeBack>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/home')}
              className="shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <CryptoIcon symbol={assetData.symbol} size="lg" />
              <div>
                <h1 className="text-lg font-bold text-foreground">{assetData.symbol}</h1>
                <p className="text-xs text-muted-foreground">{assetData.name}</p>
              </div>
            </div>
          </div>
          {/* Chain Selector - only show if asset exists on multiple chains */}
          {assetData.chains.length > 1 && (
            <ChainSelector
              selectedChain={selectedChain}
              onSelectChain={setSelectedChain}
              className="px-0"
            />
          )}
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          {/* Balance Card */}
          {isLoading ? (
            <div className="card-elevated p-4 mb-4 text-center">
              <Skeleton className="h-8 w-40 mx-auto mb-2" />
              <Skeleton className="h-5 w-24 mx-auto" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-4 mb-4 text-center"
            >
              <p className="text-3xl font-bold text-foreground mb-1">
                {displayBalance.balance.toLocaleString()} {assetData.symbol}
              </p>
              <p className="text-lg text-muted-foreground">
                {formatCurrency(displayBalance.usdValue)}
              </p>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-4"
          >
            <Button
              className="flex-1 h-10 gradient-accent text-accent-foreground"
              onClick={() => {
                if (selectedChain === 'all') {
                  // Show chain select drawer if on All view
                  if (assetData.chains.length === 1) {
                    // Only one chain, navigate directly
                    navigate(`/send?asset=${symbol}&chain=${assetData.chains[0].network}`);
                  } else {
                    setPendingAction('send');
                    setShowChainSelectDrawer(true);
                  }
                } else {
                  // Navigate directly with selected chain
                  navigate(`/send?asset=${symbol}&chain=${selectedChain}`);
                }
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              转账
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={() => {
                if (selectedChain === 'all') {
                  // Show chain select drawer if on All view
                  if (assetData.chains.length === 1) {
                    // Only one chain, navigate directly
                    navigate(`/receive?chain=${assetData.chains[0].network}`);
                  } else {
                    setPendingAction('receive');
                    setShowChainSelectDrawer(true);
                  }
                } else {
                  // Navigate directly with selected chain
                  navigate(`/receive?chain=${selectedChain}`);
                }
              }}
            >
              <QrCode className="w-4 h-4 mr-2" />
              收款
            </Button>
          </motion.div>

          {/* Chain Balance Distribution */}
          {selectedChain === 'all' && assetData.chains.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4"
            >
              <h2 className="font-semibold text-foreground text-sm mb-2">链上分布</h2>
              <div className="space-y-2">
                {assetData.chains.map((chain) => {
                  const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chain.network);
                  const address = currentWallet?.addresses?.[chain.network];
                  return (
                    <div 
                      key={chain.network}
                      className="card-elevated p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ChainIcon chainId={chain.network} size="md" />
                          <span className="font-medium text-foreground text-sm">
                            {chainInfo?.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground text-sm">
                            {chain.balance.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(chain.usdValue)}
                          </p>
                        </div>
                      </div>
                      {address && (
                        <AddressDisplay address={address} />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Address for selected chain */}
          {selectedChain !== 'all' && currentAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4"
            >
              <h2 className="font-semibold text-foreground text-sm mb-2">
                收款地址
              </h2>
              <AddressDisplay address={currentAddress} showFull />
            </motion.div>
          )}

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-foreground text-sm">交易记录</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground text-xs h-7"
                onClick={() => navigate('/history')}
              >
                查看全部
              </Button>
            </div>

            {isLoading ? (
              <TransactionListSkeleton count={4} showDateHeader={false} />
            ) : assetTransactions.length > 0 ? (
              <div className="space-y-1.5">
                {assetTransactions.map((tx, index) => (
                  <motion.button
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="w-full card-elevated p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/transaction/${tx.id}`)}
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
                            {SUPPORTED_CHAINS.find(c => c.id === tx.network)?.shortName}
                          </span>
                          {tx.status === 'pending' && (
                            <span className="text-xs text-warning flex items-center gap-0.5">
                              <AlertCircle className="w-3 h-3" />
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
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${(tx.amount * 1).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Send}
                title="暂无交易记录"
                description={selectedChain === 'all' 
                  ? `暂无 ${assetData.symbol} 的交易`
                  : `暂无 ${SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name} 链上的交易`
                }
              />
            )}
          </motion.div>
        </div>


        {/* Chain Select Drawer for All Chains view */}
        {assetData && (
          <ChainSelectDrawer
            open={showChainSelectDrawer}
            onOpenChange={setShowChainSelectDrawer}
            title={pendingAction === 'send' ? '选择转账网络' : '选择收款网络'}
            assetSymbol={assetData.symbol}
            chains={assetData.chains.map(c => ({
              network: c.network as Exclude<ChainId, 'all'>,
              balance: c.balance,
              usdValue: c.usdValue,
            }))}
            onSelectChain={(chainId) => {
              if (pendingAction === 'send') {
                navigate(`/send?asset=${symbol}&chain=${chainId}`);
              } else if (pendingAction === 'receive') {
                navigate(`/receive?chain=${chainId}`);
              }
              setPendingAction(null);
            }}
          />
        )}
      </div>
      </SwipeBack>
    </AppLayout>
  );
}
