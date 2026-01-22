import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Cloud, HardDrive, Smartphone, QrCode, 
  AlertTriangle, CheckCircle2, Loader2, ArrowLeft,
  Lock, Eye, EyeOff, Upload, FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';

type RecoveryMethod = 'cloud' | 'local_file' | 'old_device';
type RecoveryStep = 'method' | 'password' | 'scanning' | 'success';

export default function TSSRecoveryPage() {
  const [searchParams] = useSearchParams();
  const hasCloudBackup = searchParams.get('cloud') !== 'false';
  const cloudProvider = searchParams.get('provider') || 'icloud';
  const lastBackupTime = searchParams.get('time') || '3 天前';
  
  const [step, setStep] = useState<RecoveryStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { recoverTSSNode } = useWallet();

  const handleSelectMethod = (method: RecoveryMethod) => {
    setSelectedMethod(method);
    if (method === 'old_device') {
      // Go to scanning step for QR code
      setStep('scanning');
    } else {
      setStep('password');
    }
  };

  const handleRecover = async () => {
    if (!password) {
      setError('请输入备份密码');
      return;
    }
    if (password.length < 8) {
      setError('密码长度至少 8 位');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await recoverTSSNode(selectedMethod!, password);
      setStep('success');
    } catch (e) {
      setError('恢复失败，请检查密码是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanComplete = async () => {
    setIsLoading(true);
    try {
      await recoverTSSNode('old_device');
      setStep('success');
    } catch (e) {
      setError('扫码授权失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterWallet = () => {
    navigate('/home');
  };

  const handleBack = () => {
    if (step === 'password' || step === 'scanning') {
      setStep('method');
      setSelectedMethod(null);
      setPassword('');
      setError('');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {step === 'method' && '恢复安全账户'}
            {step === 'password' && '验证密码'}
            {step === 'scanning' && '扫码恢复'}
            {step === 'success' && '恢复成功'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'method' && (
            <MethodSelectionStep
              key="method"
              hasCloudBackup={hasCloudBackup}
              cloudProvider={cloudProvider}
              lastBackupTime={lastBackupTime}
              onSelect={handleSelectMethod}
            />
          )}
          {step === 'password' && (
            <PasswordStep
              key="password"
              method={selectedMethod!}
              cloudProvider={cloudProvider}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              isLoading={isLoading}
              onSubmit={handleRecover}
            />
          )}
          {step === 'scanning' && (
            <ScanningStep
              key="scanning"
              isLoading={isLoading}
              error={error}
              onComplete={handleScanComplete}
            />
          )}
          {step === 'success' && (
            <SuccessStep
              key="success"
              onEnter={handleEnterWallet}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Method Selection Step
function MethodSelectionStep({
  hasCloudBackup,
  cloudProvider,
  lastBackupTime,
  onSelect,
}: {
  hasCloudBackup: boolean;
  cloudProvider: string;
  lastBackupTime: string;
  onSelect: (method: RecoveryMethod) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header Info */}
      <div className="flex flex-col items-center text-center pt-6 pb-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4"
        >
          <Shield className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-lg font-bold text-foreground mb-2">
          检测到已有安全账户
        </h2>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          您已在其他设备创建过 TSS Node，请选择恢复方式以继续使用
        </p>
      </div>

      {/* No Cloud Backup Warning */}
      {!hasCloudBackup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">云端暂无备份</p>
              <p className="text-xs text-muted-foreground mt-1">
                您尚未在云端进行备份，请通过本地方式恢复
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recovery Options */}
      <div className="space-y-3 flex-1">
        {/* Cloud Recovery - only show if available */}
        {hasCloudBackup && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => onSelect('cloud')}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-accent/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">云端恢复</span>
                  <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                    推荐
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  从 {cloudProvider === 'icloud' ? 'iCloud' : 'Google Drive'} 恢复
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  上次备份：{lastBackupTime}
                </p>
              </div>
            </div>
          </motion.button>
        )}

        {/* Local File Recovery */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('local_file')}
          className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-accent/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-foreground">本地文件恢复</span>
              <p className="text-sm text-muted-foreground mt-1">
                导入之前导出的 .backup 文件
              </p>
            </div>
          </div>
        </motion.button>

        {/* Old Device QR Scan */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelect('old_device')}
          className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-accent/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-foreground">旧设备扫码授权</span>
              <p className="text-sm text-muted-foreground mt-1">
                使用旧设备扫描二维码完成授权
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

// Password Input Step
function PasswordStep({
  method,
  cloudProvider,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  onSubmit,
}: {
  method: RecoveryMethod;
  cloudProvider: string;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = () => {
    // Mock file selection
    setSelectedFile('wallet_backup_20250120.backup');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center pt-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4"
        >
          <Lock className="w-8 h-8 text-accent" />
        </motion.div>
        
        <h2 className="text-lg font-bold text-foreground mb-2 text-center">
          {method === 'cloud' ? '输入云备份密码' : '输入备份文件密码'}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-[280px] mb-6">
          {method === 'cloud' 
            ? `请输入您在备份到 ${cloudProvider === 'icloud' ? 'iCloud' : 'Google Drive'} 时设置的密码`
            : '请输入您在导出备份文件时设置的密码'
          }
        </p>

        {/* File Selection for local_file method */}
        {method === 'local_file' && (
          <div className="w-full max-w-[300px] mb-4">
            <Button
              variant="outline"
              className="w-full h-12 justify-start"
              onClick={handleFileSelect}
            >
              <Upload className="w-5 h-5 mr-2" />
              {selectedFile || '选择备份文件'}
            </Button>
            {selectedFile && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                已选择文件
              </p>
            )}
          </div>
        )}

        {/* Password Input */}
        <div className="w-full max-w-[300px] relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入备份密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive mt-3 flex items-center gap-1"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </div>

      <div className="pb-6">
        <Button
          size="lg"
          className="w-full h-12 text-base font-medium"
          onClick={onSubmit}
          disabled={isLoading || !password || (method === 'local_file' && !selectedFile)}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : null}
          确认恢复
        </Button>
      </div>
    </motion.div>
  );
}

// Scanning Step (QR Code)
function ScanningStep({
  isLoading,
  error,
  onComplete,
}: {
  isLoading: boolean;
  error: string;
  onComplete: () => void;
}) {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full items-center justify-center text-center"
    >
      {/* QR Code Display */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-48 h-48 bg-white rounded-2xl p-4 mb-6 shadow-lg"
      >
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
          <QrCode className="w-24 h-24 text-foreground" />
        </div>
      </motion.div>

      <h2 className="text-lg font-bold text-foreground mb-2">
        请用旧设备扫描二维码
      </h2>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
        在旧设备上打开钱包应用，扫描此二维码完成授权
      </p>

      {/* Progress indicator */}
      {scanProgress > 0 && scanProgress < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-accent"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">正在等待授权...</span>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive mt-3 flex items-center gap-1"
        >
          <AlertTriangle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

// Success Step
function SuccessStep({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-success" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-foreground mb-2"
      >
        TSS Node 恢复成功
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-[280px] mb-8"
      >
        您的安全账户已成功恢复到此设备，可以继续使用钱包了
      </motion.p>

      {/* Recovered Wallets Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-card border border-border rounded-xl p-4 mb-6"
      >
        <p className="text-xs text-muted-foreground mb-3">已恢复的钱包</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium text-foreground">主钱包</span>
            </div>
            <span className="text-sm text-muted-foreground">$47,511.00</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium text-foreground">商务钱包</span>
            </div>
            <span className="text-sm text-muted-foreground">$74,540.00</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full"
      >
        <Button
          size="lg"
          className="w-full h-12 text-base font-medium"
          onClick={onEnter}
        >
          进入钱包
        </Button>
      </motion.div>
    </motion.div>
  );
}
