import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Wallet, Plus, Check,
  CheckCircle2, AlertTriangle, Shield, MoreHorizontal,
  Edit3, Eye, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function WalletManagementPage() {
  const navigate = useNavigate();
  const { 
    wallets, currentWallet, switchWallet, 
    walletStatus, backupStatus, assets 
  } = useWallet();
  
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedWalletForRename, setSelectedWalletForRename] = useState<string | null>(null);
  const [newWalletName, setNewWalletName] = useState('');
  const [backupStatusDialogOpen, setBackupStatusDialogOpen] = useState(false);
  const [selectedWalletForBackup, setSelectedWalletForBackup] = useState<any>(null);

  // Calculate security score based on how many wallets are backed up
  const backedUpCount = wallets.filter(w => w.isBackedUp).length;
  const securityScore = wallets.length > 0 
    ? Math.round((backedUpCount / wallets.length) * 100) 
    : 0;

  // Calculate total balance for a wallet
  const getWalletBalance = (walletId: string) => {
    const totalAssets = assets.reduce((sum, a) => sum + a.usdValue, 0);
    if (walletId === wallets[0]?.id) {
      return totalAssets;
    }
    return totalAssets * 0.3;
  };

  const handleRenameWallet = (walletId: string, currentName: string) => {
    setSelectedWalletForRename(walletId);
    setNewWalletName(currentName);
    setRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (newWalletName.trim()) {
      // In real app, this would call a context method to update the wallet name
      toast.success(`钱包已重命名为 "${newWalletName}"`);
      setRenameDialogOpen(false);
      setSelectedWalletForRename(null);
      setNewWalletName('');
    }
  };

  const handleViewBackupStatus = (wallet: any) => {
    setSelectedWalletForBackup(wallet);
    setBackupStatusDialogOpen(true);
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
              {backedUpCount < wallets.length && (
                <p className="text-muted-foreground">• {wallets.length - backedUpCount} 个钱包未完成备份</p>
              )}
              {securityScore === 100 && (
                <p className="text-success flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  所有钱包已完成备份
                </p>
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
                const balance = getWalletBalance(wallet.id);
                const isBackedUp = wallet.isBackedUp;
                
                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="w-full card-elevated p-4 flex items-center gap-3"
                  >
                    {/* Wallet Icon */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-muted">
                      <Wallet className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    {/* Wallet Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {wallet.name}
                        </p>
                        {!isBackedUp && (
                          <Badge variant="outline" className="text-xs border-warning/50 text-warning bg-warning/10">
                            未备份
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameWallet(wallet.id, wallet.name)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          修改名称
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewBackupStatus(wallet)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看备份状态
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
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

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改钱包名称</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              placeholder="输入新的钱包名称"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmRename}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Status Dialog */}
      <Dialog open={backupStatusDialogOpen} onOpenChange={setBackupStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>备份状态</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedWalletForBackup && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedWalletForBackup.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedWalletForBackup.isBackedUp ? '已备份' : '未备份'}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  'p-3 rounded-lg',
                  selectedWalletForBackup.isBackedUp ? 'bg-success/10' : 'bg-warning/10'
                )}>
                  {selectedWalletForBackup.isBackedUp ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">该钱包已完成安全备份</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-medium">该钱包尚未备份</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setBackupStatusDialogOpen(false);
                          navigate('/backup');
                        }}
                      >
                        立即备份
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
