import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Wallet, Plus,
  CheckCircle2, AlertTriangle, Shield, MoreHorizontal,
  Edit3, Cloud, HardDrive, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { getTSSNodeInfo, formatTimeAgo } from '@/lib/tss-node';

export default function WalletManagementPage() {
  const navigate = useNavigate();
  const { wallets, assets, renameWallet } = useWallet();
  
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedWalletForRename, setSelectedWalletForRename] = useState<string | null>(null);
  const [newWalletName, setNewWalletName] = useState('');

  // Get TSS Node backup info
  const tssNodeInfo = getTSSNodeInfo();
  const backup = tssNodeInfo.backup;
  const hasCloudBackup = backup.hasCloudBackup;
  const hasLocalBackup = backup.hasLocalBackup;
  const backupComplete = hasCloudBackup && hasLocalBackup;

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
    if (newWalletName.trim() && selectedWalletForRename) {
      renameWallet(selectedWalletForRename, newWalletName.trim());
      toast.success(`钱包已重命名为 "${newWalletName.trim()}"`);
      setRenameDialogOpen(false);
      setSelectedWalletForRename(null);
      setNewWalletName('');
    }
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
          {/* TSS Node Backup Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'card-elevated p-4 mb-4',
              !backupComplete ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Shield className={cn(
                "w-5 h-5",
                backupComplete ? "text-success" : "text-warning"
              )} />
              <span className="font-semibold text-foreground">安全账户备份状态</span>
            </div>
            
            {/* Backup Channels Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Cloud Backup */}
              <div className={cn(
                "p-3 rounded-xl",
                hasCloudBackup ? "bg-success/10" : "bg-muted/30"
              )}>
                <Cloud className={cn(
                  "w-5 h-5 mb-2",
                  hasCloudBackup ? "text-success" : "text-muted-foreground"
                )} />
                <p className="text-sm font-medium">
                  {hasCloudBackup 
                    ? (backup.cloudProvider === 'icloud' ? 'iCloud' : 'Google Drive')
                    : '云端备份'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasCloudBackup && backup.cloudBackupTime
                    ? formatTimeAgo(backup.cloudBackupTime)
                    : '未完成'
                  }
                </p>
              </div>
              
              {/* Local Backup */}
              <div className={cn(
                "p-3 rounded-xl",
                hasLocalBackup ? "bg-success/10" : "bg-muted/30"
              )}>
                <HardDrive className={cn(
                  "w-5 h-5 mb-2",
                  hasLocalBackup ? "text-success" : "text-muted-foreground"
                )} />
                <p className="text-sm font-medium">本地备份</p>
                <p className="text-xs text-muted-foreground">
                  {hasLocalBackup && backup.localBackupTime
                    ? formatTimeAgo(backup.localBackupTime)
                    : '未完成'
                  }
                </p>
              </div>
            </div>
            
            {/* Warning if incomplete */}
            {!backupComplete && (
              <div className="flex items-center gap-3 p-4 bg-warning-surface border border-warning/30 rounded-xl mb-4">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-foreground flex-1">
                  建议同时完成云端和本地备份，确保账户安全
                </p>
              </div>
            )}
            
            {/* Complete status */}
            {backupComplete && (
              <div className="flex items-center gap-2 text-success mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">备份已完成</span>
              </div>
            )}
            
            {/* Manage Backup Button */}
            <Button
              variant="outline"
              className="w-full h-10"
              onClick={() => navigate('/profile/security/tss-backup')}
            >
              <Shield className="w-4 h-4 mr-2" />
              管理备份
            </Button>
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
              {wallets.filter(w => !w.isEscaped).map((wallet, index) => {
                const balance = getWalletBalance(wallet.id);
                
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
                      <p className="font-semibold text-foreground">
                        {wallet.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    {/* Menu - Only rename option now */}
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* MPC Info - Orange Tier Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-warning-surface rounded-xl border border-warning/30 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-warning" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                MPC 多重签名保护
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                您的每个钱包都受到银行级安全保护，私钥分片存储，任何单一方都无法访问您的资产。
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Rename Drawer */}
      <Drawer open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>修改钱包名称</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <Input
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              placeholder="输入新的钱包名称"
            />
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={confirmRename}>
              确认
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

    </AppLayout>
  );
}
