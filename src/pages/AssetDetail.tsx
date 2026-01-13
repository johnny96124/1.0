import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, QrCode, TrendingUp, TrendingDown, 
  CheckCircle2, AlertCircle, ChevronRight, Clock, XCircle, Copy, ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainSelector } from '@/components/ChainSelector';
import { AddressDisplay } from '@/components/AddressDisplay';
import { CryptoIcon } from '@/components/CryptoIcon';
import { ChainIcon } from '@/components/ChainIcon';
import { ChainId, SUPPORTED_CHAINS, Transaction } from '@/types/wallet';
import { toast } from '@/hooks/use-toast';

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedChain, setSelectedChain] = useState<ChainId>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { assets, transactions, currentWallet } = useWallet();

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板",
    });
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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <CryptoIcon symbol={assetData.symbol} size="lg" />
              <div>
                <h1 className="text-lg font-bold text-foreground">{assetData.symbol}</h1>
                <p className="text-xs text-muted-foreground">{assetData.name}</p>
              </div>
            </div>
          </div>
          {/* Chain Selector moved to header */}
          <ChainSelector
            selectedChain={selectedChain}
            onSelectChain={setSelectedChain}
            className="px-0"
          />
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4 mb-4 text-center"
          >
            <p className="text-3xl font-bold text-foreground mb-1">
              {displayBalance.balance.toLocaleString()} {assetData.symbol}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-muted-foreground">
                {formatCurrency(displayBalance.usdValue)}
              </span>
              {assetData.change24h !== 0 && (
                <span className={cn(
                  'text-sm flex items-center',
                  assetData.change24h > 0 ? 'text-success' : 'text-destructive'
                )}>
                  {assetData.change24h > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-0.5" />
                  )}
                  {Math.abs(assetData.change24h)}%
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-4"
          >
            <Button
              className="flex-1 h-10 gradient-accent text-accent-foreground"
              onClick={() => navigate(`/send?asset=${symbol}`)}
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

            {assetTransactions.length > 0 ? (
              <div className="space-y-1.5">
                {assetTransactions.map((tx, index) => (
                  <motion.button
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="card-elevated p-3 flex items-center justify-between w-full text-left"
                    onClick={() => setSelectedTx(tx)}
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
                            {SUPPORTED_CHAINS.find(c => c.id === tx.network)?.shortName}
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
                      <p className={cn(
                        'font-medium text-sm',
                        tx.type === 'receive' ? 'text-success' : 'text-foreground'
                      )}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-6 text-center">
                <p className="text-muted-foreground text-sm">暂无交易记录</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedChain === 'all' 
                    ? `暂无 ${assetData.symbol} 的交易`
                    : `暂无 ${SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name} 链上的交易`
                  }
                </p>
              </div>
            )}
          </motion.div>
        </div>

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

                {/* Transaction Status */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                    {getStatusIcon(selectedTx.status)}
                  </div>
                  <p className="font-semibold text-lg">
                    {selectedTx.type === 'receive' ? '收款' : '转账'}
                    {getStatusText(selectedTx.status)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-center mb-6">
                  <p className={cn(
                    'text-3xl font-bold',
                    selectedTx.type === 'receive' ? 'text-success' : 'text-foreground'
                  )}>
                    {selectedTx.type === 'receive' ? '+' : '-'}{selectedTx.amount} {selectedTx.symbol}
                  </p>
                  <p className="text-muted-foreground">
                    ≈ ${(selectedTx.amount * 1).toFixed(2)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">
                      {selectedTx.type === 'receive' ? '付款方' : '收款方'}
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedTx.counterpartyLabel || 
                        `${selectedTx.counterparty.slice(0, 8)}...${selectedTx.counterparty.slice(-6)}`}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">网络</span>
                    <div className="flex items-center gap-1.5">
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
                          onClick={() => copyToClipboard(selectedTx.txHash!)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Button */}
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
      </div>
    </AppLayout>
  );
}
