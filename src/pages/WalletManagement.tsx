import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Wallet, ChevronRight, Plus, Check,
  CheckCircle2, AlertTriangle, Shield, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WalletManagementPage() {
  const navigate = useNavigate();
  const { 
    wallets, currentWallet, switchWallet, 
    walletStatus, backupStatus, assets 
  } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Calculate security score
  const securityScore = walletStatus === 'fully_secure' ? 100 : 
                        walletStatus === 'backup_complete' ? 80 :
                        walletStatus === 'created_no_backup' ? 40 : 0;

  // Calculate total balance for a wallet
  const getWalletBalance = (walletId: string) => {
    const totalAssets = assets.reduce((sum, a) => sum + a.usdValue, 0);
    if (walletId === wallets[0]?.id) {
      return totalAssets;
    }
    return totalAssets * 0.3;
  };

  const handleSelectWallet = (walletId: string) => {
    if (walletId !== currentWallet?.id) {
      switchWallet(walletId);
      toast.success('已切换钱包');
    }
    setSelectedWallet(null);
  };

  return (
    <AppLayout showNav={false}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">钱包管理</h1>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          {/* Security Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'card-elevated p-4 mb-4',
              securityScore < 60 ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {securityScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
                <span className="font-semibold text-foreground">安全等级</span>
              </div>
              <span className={cn(
                'text-2xl font-bold',
                securityScore >= 80 ? 'text-success' : 'text-warning'
              )}>
                {securityScore}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${securityScore}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  'h-full rounded-full',
                  securityScore >= 80 ? 'bg-success' : 'bg-warning'
                )}
              />
            </div>
            <div className="space-y-1 text-sm">
              {!backupStatus.cloudBackup && (
                <p className="text-muted-foreground">• 未完成云备份</p>
              )}
              {securityScore === 100 && (
                <p className="text-success flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  已开启全部安全保护
                </p>
              )}
              {securityScore < 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent p-0 h-auto"
                  onClick={() => navigate('/onboarding')}
                >
                  完善安全设置 →
                </Button>
              )}
            </div>
          </motion.div>

          {/* Wallet List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">我的钱包</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-accent h-8 gap-1"
                onClick={() => navigate('/create-wallet')}
              >
                <Plus className="w-4 h-4" />
                创建钱包
              </Button>
            </div>

            <div className="space-y-2">
              {wallets.map((wallet, index) => {
                const isActive = wallet.id === currentWallet?.id;
                const balance = getWalletBalance(wallet.id);
                
                return (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => handleSelectWallet(wallet.id)}
                    className={cn(
                      "w-full card-elevated p-4 flex items-center gap-3 transition-colors",
                      isActive 
                        ? "border-accent/30 bg-accent/5" 
                        : "hover:bg-muted/30"
                    )}
                  >
                    {/* Wallet Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isActive ? "gradient-primary" : "bg-muted"
                    )}>
                      <Wallet className={cn(
                        "w-6 h-6",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    {/* Wallet Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-semibold",
                          isActive ? "text-accent" : "text-foreground"
                        )}>
                          {wallet.name}
                        </p>
                        {isActive && (
                          <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                            当前
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {wallet.addresses?.ethereum 
                          ? `${wallet.addresses.ethereum.slice(0, 8)}...${wallet.addresses.ethereum.slice(-6)}`
                          : '未创建地址'}
                      </p>
                    </div>
                    
                    {/* Chevron */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Wallet Actions Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-muted/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  MPC 多重签名保护
                </p>
                <p className="text-xs text-muted-foreground">
                  您的每个钱包都受到银行级安全保护，私钥分片存储，任何单一方都无法访问您的资产。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
