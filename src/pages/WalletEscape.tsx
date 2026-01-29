import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, AlertTriangle, Shield, ShieldOff, Key, Cloud,
  FileArchive, Smartphone, Check, Loader2, Download, Lock,
  Eye, EyeOff, CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/WalletContext';

type KeySource = 'device' | 'icloud' | 'google_drive' | 'local_file';

interface KeySourceOption {
  id: KeySource;
  title: string;
  description: string;
  icon: typeof Smartphone;
  available: boolean;
}

export default function WalletEscapePage() {
  const navigate = useNavigate();
  const { id: walletId } = useParams();
  const { wallets } = useWallet();
  const wallet = wallets.find(w => w.id === walletId);

  const [step, setStep] = useState(0);
  const [confirmations, setConfirmations] = useState({
    understand: false,
    noProtection: false,
    backedUp: false,
  });
  const [selectedKeySource, setSelectedKeySource] = useState<KeySource | null>(null);
  const [password, setPassword] = useState('');
  const [exportPassword, setExportPassword] = useState('');
  const [confirmExportPassword, setConfirmExportPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState(0);

  const keySources: KeySourceOption[] = [
    {
      id: 'device',
      title: '当前设备',
      description: '使用存储在此设备上的密钥分片',
      icon: Smartphone,
      available: true,
    },
    {
      id: 'icloud',
      title: 'iCloud 备份',
      description: '从 iCloud 获取密钥',
      icon: Cloud,
      available: wallet?.backupInfo?.cloudProvider === 'icloud',
    },
    {
      id: 'google_drive',
      title: 'Google Drive 备份',
      description: '从 Google Drive 获取密钥',
      icon: Cloud,
      available: wallet?.backupInfo?.cloudProvider === 'google_drive',
    },
    {
      id: 'local_file',
      title: '本地备份文件',
      description: '从本地备份文件提取密钥',
      icon: FileArchive,
      available: true,
    },
  ];

  const allConfirmed = confirmations.understand && confirmations.noProtection && confirmations.backedUp;

  const handleStartEscape = () => {
    if (!allConfirmed) {
      toast.error('请确认所有风险提示');
      return;
    }
    setStep(1);
  };

  const handleSelectKeySource = (source: KeySource) => {
    setSelectedKeySource(source);
    setStep(2);
  };

  const handleVerifyIdentity = async () => {
    if (!password.trim()) {
      toast.error('请输入密码');
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setStep(3);
    
    // Start synthesis animation
    startSynthesis();
  };

  const startSynthesis = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSynthesisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep(4), 500);
      }
    }, 500);
  };

  const handleExportKey = async () => {
    if (!exportPassword.trim() || exportPassword !== confirmExportPassword) {
      toast.error('请确认两次输入的密码一致');
      return;
    }
    if (exportPassword.length < 8) {
      toast.error('密码长度至少 8 位');
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    toast.success('私钥文件已生成');
    setStep(5);
  };

  const handleComplete = () => {
    toast.success('MPC 逃逸完成，钱包已转为自托管模式');
    navigate('/profile/wallets');
  };

  // Step 0: Risk Warning
  const renderRiskWarning = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Danger Header */}
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto mb-4 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-destructive mb-2">MPC 逃逸</h2>
        <p className="text-sm text-muted-foreground">
          此操作将使钱包脱离 MPC 保护，转为自托管模式
        </p>
      </div>

      {/* What you'll lose */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">逃逸后您将失去：</h3>
        <div className="space-y-2">
          {[
            'MPC 多重签名保护',
            'Cobo 交易风控服务',
            'KYT 反洗钱监测',
            '交易限额保护',
            '设备授权管理',
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmations */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
        <p className="text-sm font-medium text-foreground">请确认以下内容：</p>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={confirmations.understand}
            onCheckedChange={(checked) => 
              setConfirmations(prev => ({ ...prev, understand: !!checked }))
            }
            className="mt-0.5"
          />
          <span className="text-sm text-muted-foreground">
            我理解逃逸后钱包将变为自托管模式，<span className="text-destructive font-medium">此操作不可逆</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={confirmations.noProtection}
            onCheckedChange={(checked) => 
              setConfirmations(prev => ({ ...prev, noProtection: !!checked }))
            }
            className="mt-0.5"
          />
          <span className="text-sm text-muted-foreground">
            我理解 Cobo 将不再提供任何安全保护，资产安全由我自己负责
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={confirmations.backedUp}
            onCheckedChange={(checked) => 
              setConfirmations(prev => ({ ...prev, backedUp: !!checked }))
            }
            className="mt-0.5"
          />
          <span className="text-sm text-muted-foreground">
            我已做好私钥备份准备，理解丢失私钥后资产将无法找回
          </span>
        </label>
      </div>

      <Button 
        className="w-full bg-destructive hover:bg-destructive/90"
        onClick={handleStartEscape}
        disabled={!allConfirmed}
      >
        <ShieldOff className="w-4 h-4 mr-2" />
        我已了解风险，继续逃逸
      </Button>
    </motion.div>
  );

  // Step 1: Select Key Source
  const renderKeySourceSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">选择密钥来源</h2>
        <p className="text-sm text-muted-foreground">
          选择用于合成完整私钥的密钥分片来源
        </p>
      </div>

      <div className="space-y-3">
        {keySources.map(source => (
          <button
            key={source.id}
            onClick={() => source.available && handleSelectKeySource(source.id)}
            disabled={!source.available}
            className={cn(
              "w-full p-4 rounded-xl border flex items-center gap-4 transition-all",
              source.available 
                ? "border-border hover:border-accent hover:bg-accent/5" 
                : "border-border/50 opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              source.available ? "bg-muted" : "bg-muted/50"
            )}>
              <source.icon className={cn(
                "w-6 h-6",
                source.available ? "text-muted-foreground" : "text-muted-foreground/50"
              )} />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "font-medium",
                source.available ? "text-foreground" : "text-muted-foreground"
              )}>
                {source.title}
              </p>
              <p className="text-sm text-muted-foreground">{source.description}</p>
            </div>
            {!source.available && (
              <span className="text-xs text-muted-foreground">不可用</span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );

  // Step 2: Verify Identity
  const renderIdentityVerification = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto mb-4 flex items-center justify-center">
          <Lock className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">身份验证</h2>
        <p className="text-sm text-muted-foreground">
          {selectedKeySource === 'device' 
            ? '请输入 PIN 码验证身份'
            : '请输入备份密码验证身份'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={selectedKeySource === 'device' ? '输入 PIN 码' : '输入备份密码'}
            className="pr-10 text-center text-lg tracking-widest"
            maxLength={selectedKeySource === 'device' ? 6 : 50}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button 
          className="w-full"
          onClick={handleVerifyIdentity}
          disabled={isProcessing || !password.trim()}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? '验证中...' : '确认验证'}
        </Button>
      </div>
    </motion.div>
  );

  // Step 3: Key Synthesis
  const renderKeySynthesis = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px]"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-accent/20 border-t-accent mb-8"
      />

      <h2 className="text-lg font-semibold text-foreground mb-2">正在合成私钥</h2>
      <p className="text-sm text-muted-foreground text-center mb-8">
        请勿关闭此页面
      </p>

      <div className="w-full max-w-xs mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">合成进度</span>
          <span className="text-sm font-medium text-foreground">{synthesisProgress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${synthesisProgress}%` }}
            className="h-full bg-accent rounded-full"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className={cn("w-4 h-4", synthesisProgress > 20 ? "text-success" : "")} />
          <span>获取本地密钥分片</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className={cn("w-4 h-4", synthesisProgress > 40 ? "text-success" : "")} />
          <span>验证分片完整性</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className={cn("w-4 h-4", synthesisProgress > 60 ? "text-success" : "")} />
          <span>请求服务器分片</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className={cn("w-4 h-4", synthesisProgress > 80 ? "text-success" : "")} />
          <span>合成完整私钥</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className={cn("w-4 h-4", synthesisProgress >= 100 ? "text-success" : "")} />
          <span>准备导出</span>
        </div>
      </div>
    </motion.div>
  );

  // Step 4: Export Private Key
  const renderExportKey = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
          <Key className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">私钥合成完成</h2>
        <p className="text-sm text-muted-foreground">
          设置密码加密并导出私钥文件
        </p>
      </div>

      <div className="p-4 bg-warning-surface border border-warning/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">安全提示</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              请将私钥文件保存在安全的地方，切勿分享给他人。丢失私钥将导致资产无法找回。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">设置导出密码</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={exportPassword}
              onChange={(e) => setExportPassword(e.target.value)}
              placeholder="至少 8 位字符"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">确认密码</label>
          <Input
            type="password"
            value={confirmExportPassword}
            onChange={(e) => setConfirmExportPassword(e.target.value)}
            placeholder="再次输入密码"
          />
        </div>

        <Button 
          className="w-full"
          onClick={handleExportKey}
          disabled={isProcessing || !exportPassword.trim() || exportPassword !== confirmExportPassword}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? '生成中...' : '导出私钥文件'}
        </Button>
      </div>
    </motion.div>
  );

  // Step 5: Complete
  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-success" />
      </motion.div>

      <h2 className="text-xl font-bold text-foreground mb-2">逃逸完成</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        钱包已转为自托管模式
      </p>

      {/* Downloaded file info */}
      <div className="card-elevated p-4 w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">私钥文件已保存</p>
            <p className="text-xs text-muted-foreground">{wallet?.name || '我的钱包'}_privatekey.key</p>
          </div>
          <Check className="w-5 h-5 text-success" />
        </div>
      </div>

      <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl w-full mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning mb-1">重要提醒</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 请妥善保管私钥文件</li>
              <li>• 此钱包不再受 MPC 保护</li>
              <li>• 交易将不再有限额控制</li>
            </ul>
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={handleComplete}>
        完成
      </Button>
    </motion.div>
  );

  const renderContent = () => {
    switch (step) {
      case 0: return renderRiskWarning();
      case 1: return renderKeySourceSelection();
      case 2: return renderIdentityVerification();
      case 3: return renderKeySynthesis();
      case 4: return renderExportKey();
      case 5: return renderComplete();
      default: return renderRiskWarning();
    }
  };

  if (!wallet) {
    return (
      <AppLayout showNav={false}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">钱包不存在</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNav={false}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (step > 0 && step < 3) {
                setStep(step - 1);
              } else if (step === 0) {
                navigate(-1);
              }
            }}
            disabled={step >= 3 && step < 5}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">MPC 逃逸</h1>
        </div>

        {/* Progress indicator */}
        {step > 0 && step < 5 && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors",
                    s <= step ? "bg-accent" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
