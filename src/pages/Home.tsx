import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, ChevronRight, Send, QrCode, 
  TrendingUp, TrendingDown, Wallet, Plus, Shield,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [hideBalance, setHideBalance] = useState(false);
  const navigate = useNavigate();
  const { assets, transactions, currentWallet, walletStatus, backupStatus } = useWallet();

  const totalBalance = assets.reduce((sum, asset) => sum + asset.usdValue, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">当前钱包</p>
              <p className="font-semibold text-foreground">{currentWallet?.name || '主钱包'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile/wallets')}
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">总资产</span>
            <button onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
          
          <motion.p
            key={hideBalance ? 'hidden' : 'shown'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-foreground mb-6"
          >
            {hideBalance ? '****.**' : formatCurrency(totalBalance)}
          </motion.p>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 gradient-accent text-accent-foreground"
              onClick={() => navigate('/send')}
            >
              <Send className="w-4 h-4 mr-2" />
              转账
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
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
            className="card-elevated p-4 mb-6 border-warning/30 bg-warning/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">完善安全设置</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  完成备份以解锁全部转账功能
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-warning"
                onClick={() => navigate('/backup')}
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
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">资产</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              管理
            </Button>
          </div>

          <div className="space-y-2">
            {assets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-elevated p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                    {asset.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{asset.symbol}</p>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {hideBalance ? '****' : asset.balance.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-sm text-muted-foreground">
                      {hideBalance ? '**' : formatCurrency(asset.usdValue)}
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">最近交易</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => navigate('/history')}
            >
              查看全部
            </Button>
          </div>

          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-elevated p-4 flex items-center justify-between"
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
                      {tx.counterpartyLabel || tx.counterparty}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                    'font-medium',
                    tx.type === 'receive' ? 'text-success' : 'text-foreground'
                  )}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="card-elevated p-8 text-center">
              <p className="text-muted-foreground">暂无交易记录</p>
              <p className="text-sm text-muted-foreground mt-1">
                分享收款地址给付款方开始收款
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
