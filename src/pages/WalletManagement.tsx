import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Wallet, Plus, Check,
  CheckCircle2, AlertTriangle, Shield, MoreHorizontal,
  Edit3, Eye, Trash2, Cloud, FileArchive, Key, Download, Fingerprint
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet as WalletType } from '@/types/wallet';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

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
  const [privateKeyDialogOpen, setPrivateKeyDialogOpen] = useState(false);
  const [selectedWalletForKey, setSelectedWalletForKey] = useState<WalletType | null>(null);
  const [passkeyStep, setPasskeyStep] = useState<'verify' | 'show'>('verify');
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Get backup channel icon
  const getBackupIcon = (wallet: WalletType) => {
    if (!wallet.backupInfo) return null;
    
    if (wallet.backupInfo.cloudProvider === 'icloud') {
      return { icon: Cloud, color: 'text-blue-500', label: 'iCloud' };
    }
    if (wallet.backupInfo.cloudProvider === 'google_drive') {
      return { icon: Cloud, color: 'text-green-500', label: 'Google Drive' };
    }
    if (wallet.backupInfo.method === 'file') {
      return { icon: FileArchive, color: 'text-muted-foreground', label: '本地文件' };
    }
    return null;
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

  const handleViewPrivateKey = (wallet: WalletType) => {
    setSelectedWalletForKey(wallet);
    setPasskeyStep('verify');
    setPrivateKeyDialogOpen(true);
  };

  const handlePasskeyVerify = async () => {
    setIsVerifying(true);
    // Simulate passkey verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerifying(false);
    setPasskeyStep('show');
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText('0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890');
    toast.success('私钥已复制到剪贴板');
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
                const isEscaped = wallet.isEscaped;
                const backupChannel = getBackupIcon(wallet);
                
                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={cn(
                      "w-full card-elevated p-4 flex items-center gap-3",
                      isEscaped && "border-warning/50"
                    )}
                  >
                    {/* Wallet Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isEscaped ? "bg-warning/10" : "bg-muted"
                    )}>
                      {isEscaped ? (
                        <Key className="w-6 h-6 text-warning" />
                      ) : (
                        <Wallet className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Wallet Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {wallet.name}
                        </p>
                        {isEscaped ? (
                          <Badge variant="outline" className="text-xs border-warning/50 text-warning bg-warning/10">
                            自托管
                          </Badge>
                        ) : !isBackedUp ? (
                          <Badge variant="outline" className="text-xs border-warning/50 text-warning bg-warning/10">
                            未备份
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-muted-foreground">
                          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {/* Backup channel indicator */}
                        {backupChannel && !isEscaped && (
                          <div className="flex items-center gap-1">
                            <backupChannel.icon className={cn("w-3 h-3", backupChannel.color)} />
                            <span className="text-xs text-muted-foreground">{backupChannel.label}</span>
                          </div>
                        )}
                      </div>
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
                        {isEscaped ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleViewPrivateKey(wallet)}
                              className="text-warning focus:text-warning"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              查看私钥
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => navigate(`/wallet/escape/${wallet.id}`)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              MPC 逃逸
                            </DropdownMenuItem>
                          </>
                        )}
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

          {/* Import/Recover Wallet Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={() => navigate('/wallet/recovery')}
            >
              <Download className="w-4 h-4" />
              导入/恢复钱包
            </Button>
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

      {/* Backup Status Drawer */}
      <Drawer open={backupStatusDialogOpen} onOpenChange={setBackupStatusDialogOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>备份状态</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-4">
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
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-medium">该钱包尚未备份</span>
                      </div>
                      <Button 
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
        </DrawerContent>
      </Drawer>

      {/* Private Key Drawer */}
      <Drawer open={privateKeyDialogOpen} onOpenChange={(open) => {
        setPrivateKeyDialogOpen(open);
        if (!open) {
          setPasskeyStep('verify');
          setSelectedWalletForKey(null);
        }
      }}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {passkeyStep === 'verify' ? '身份验证' : '查看私钥'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {passkeyStep === 'verify' ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <Fingerprint className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground mb-1">需要验证身份</p>
                    <p className="text-sm text-muted-foreground">
                      为保护您的资产安全，请使用 Passkey 验证身份
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full h-12" 
                  onClick={handlePasskeyVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2" />
                      使用 Passkey 验证
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Warning */}
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">安全警告</p>
                      <p className="text-xs text-destructive/80 mt-1">
                        私钥是访问您资产的唯一凭证，请勿截屏、拍照或分享给他人。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedWalletForKey?.name}</p>
                    <p className="text-xs text-muted-foreground">自托管钱包</p>
                  </div>
                </div>

                {/* Private Key Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">私钥</label>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border break-all font-mono text-sm text-foreground">
                    0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
                  </div>
                </div>

                {/* Copy Button */}
                <Button 
                  variant="outline" 
                  className="w-full h-11"
                  onClick={handleCopyPrivateKey}
                >
                  复制私钥
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
