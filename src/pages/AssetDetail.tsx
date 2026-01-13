import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, QrCode, TrendingUp, TrendingDown, 
  CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet, aggregateAssets } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { ChainSelector } from '@/components/ChainSelector';
import { AddressDisplay } from '@/components/AddressDisplay';
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedChain, setSelectedChain] = useState<ChainId>('all');
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
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{assetData.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-foreground">{assetData.symbol}</h1>
              <p className="text-xs text-muted-foreground">{assetData.name}</p>
            </div>
          </div>
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

          {/* Chain Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <h2 className="font-semibold text-foreground text-sm mb-2">选择网络</h2>
            <ChainSelector
              selectedChain={selectedChain}
              onSelectChain={setSelectedChain}
            />
          </motion.div>

          {/* Chain Balance Distribution */}
          {selectedChain === 'all' && assetData.chains.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                          <span className="text-lg">{chainInfo?.icon}</span>
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
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <h2 className="font-semibold text-foreground text-sm mb-2">
                {SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name} 地址
              </h2>
              <AddressDisplay address={currentAddress} showFull />
            </motion.div>
          )}

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
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
                  </motion.div>
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
      </div>
    </AppLayout>
  );
}
