import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Fingerprint, Lock, CloudUpload, CloudDownload,
  CheckCircle2, Loader2, ChevronRight, Eye, EyeOff,
  AlertTriangle, Smartphone, QrCode, FileDown, ArrowLeft,
  Cloud, HardDrive, Upload, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Create wallet steps - optimized to 3 steps
const createSteps = [
  { id: 1, title: '安全授权', icon: Shield },
  { id: 2, title: '创建钱包', icon: Fingerprint },
  { id: 3, title: '云端备份', icon: CloudUpload },
];

// Recovery steps
const recoverySteps = [
  { id: 1, title: '选择方式', icon: CloudDownload },
  { id: 2, title: '恢复数据', icon: Shield },
  { id: 3, title: '安全验证', icon: Fingerprint },
  { id: 4, title: '完成恢复', icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const isRecoveryMode = searchParams.get('recover') === 'true';
  const isNewUser = searchParams.get('new') === 'true';
  
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { 
    enableBiometric, setPin, createWallet, 
    completeCloudBackup, hasBiometric, hasPin 
  } = useWallet();

  const steps = isRecoveryMode ? recoverySteps : createSteps;
  const progress = (currentStep / steps.length) * 100;

  const handleStepComplete = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (isNewUser) {
      // New users can't go back to login, redirect to first step
      setCurrentStep(1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Progress Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBack}
              className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              步骤 {currentStep} / {steps.length}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {steps[currentStep - 1].title}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isComplete && 'bg-success text-success-foreground',
                    isCurrent && 'bg-accent text-accent-foreground',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-8 h-0.5 mx-1',
                      currentStep > step.id ? 'bg-success' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 overflow-auto">
        <AnimatePresence mode="wait">
          {isRecoveryMode ? (
            // Recovery Flow
            <>
              {currentStep === 1 && (
                <RecoveryMethodStep key="method" onComplete={handleStepComplete} />
              )}
              {currentStep === 2 && (
                <RecoveryDataStep key="data" onComplete={handleStepComplete} />
              )}
              {currentStep === 3 && (
                <RecoveryVerifyStep key="verify" onComplete={handleStepComplete} />
              )}
              {currentStep === 4 && (
                <RecoveryCompleteStep key="complete" onComplete={handleStepComplete} />
              )}
            </>
          ) : (
            // Create Wallet Flow - Optimized to 3 steps
            <>
              {currentStep === 1 && (
                <SystemAuthStep key="auth" onComplete={handleStepComplete} />
              )}
              {currentStep === 2 && (
                <CreateWalletStep key="create" onComplete={handleStepComplete} />
              )}
              {currentStep === 3 && (
                <CloudBackupStep key="backup" onComplete={handleStepComplete} />
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== CREATE WALLET FLOW ====================

// Step 1: System Authentication Authorization (merged Biometric + PIN)
function SystemAuthStep({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { enableBiometric } = useWallet();

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      // Call system authentication API (simulated)
      // In real scenario, this triggers Face ID / Fingerprint / Device Passcode
      await enableBiometric();
      onComplete();
    } catch (error) {
      console.error('Authorization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Shield className="w-10 h-10 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-3">
          授权使用系统安全认证
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
          我们将使用您设备的安全认证方式
          <br />
          <span className="text-foreground/80">（面容ID / 指纹 / 设备密码）</span>
          <br />
          保护您的资产安全
        </p>

        {/* Security features */}
        <div className="mt-8 space-y-3 w-full max-w-[280px]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm text-foreground">设备级别安全保护</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm text-foreground">生物识别快速验证</span>
          </div>
        </div>
      </div>

      <div className="pb-6 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleAuthorize}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Lock className="w-5 h-5 mr-2" />
          )}
          授权安全认证
        </Button>
        
        <button 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto block"
        >
          了解更多
        </button>
      </div>
    </motion.div>
  );
}

// Step 2: Create Wallet
function CreateWalletStep({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const { createWallet } = useWallet();

  const phases = [
    '正在为您创建安全账户…',
    '正在完成安全初始化…',
    '即将完成…'
  ];

  useEffect(() => {
    const createAndAnimate = async () => {
      const phaseInterval = setInterval(() => {
        setPhase(p => Math.min(p + 1, phases.length - 1));
      }, 1000);

      try {
        await createWallet('主钱包');
        clearInterval(phaseInterval);
        setPhase(phases.length - 1);
        setTimeout(onComplete, 500);
      } catch (error) {
        clearInterval(phaseInterval);
        console.error('Create wallet failed:', error);
      }
    };

    createAndAnimate();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full items-center justify-center text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
      >
        <Shield className="w-12 h-12 text-accent" />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium text-foreground"
        >
          {phases[phase]}
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: phase >= i ? [1, 1.2, 1] : 1,
              opacity: phase >= i ? 1 : 0.3
            }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="w-2 h-2 rounded-full bg-accent"
          />
        ))}
      </div>
    </motion.div>
  );
}

// Step 3: Cloud Backup Only (simplified - iCloud only for Apple ecosystem)
function CloudBackupStep({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { completeCloudBackup } = useWallet();

  const validatePassword = () => {
    if (password.length < 8 || password.length > 32) {
      return '密码需要 8-32 位';
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return '密码必须包含字母和数字';
    }
    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }
    return null;
  };

  const handleBackup = async () => {
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!confirmed) {
      setError('请确认您已牢记密码');
      return;
    }

    setIsLoading(true);
    try {
      await completeCloudBackup('icloud', password);
      setShowSuccess(true);
    } catch (error) {
      setError('备份失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipClick = () => {
    setShowSkipWarning(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    onComplete();
  };

  // Success screen after backup
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col h-full"
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            云端备份完成
          </h2>
          <p className="text-muted-foreground text-sm max-w-[280px] mb-6">
            您的钱包已安全备份到 iCloud
          </p>

          {/* Completed backup indicator */}
          <div className="w-full max-w-[300px] mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
              <Cloud className="w-5 h-5 text-success" />
              <span className="text-sm text-success font-medium">云备份已完成</span>
              <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
            </div>
          </div>

          {/* Local backup hint */}
          <div className="w-full max-w-[300px] p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground text-left">
                您还可以在「设置 &gt; 安全 &gt; 备份管理」中导出本地备份文件，实现双重保障
              </p>
            </div>
          </div>
        </div>

        <div className="pb-8">
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium"
            onClick={onComplete}
          >
            开始使用钱包
          </Button>
        </div>
      </motion.div>
    );
  }

  // Main backup screen - directly show password form (no provider selection needed)
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center pt-8">
        {/* iCloud indicator */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4"
        >
          <Cloud className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          备份到 iCloud
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] text-center mb-4">
          设置密码加密您的云端备份，用于换机或找回资金
        </p>

        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 max-w-[300px] mb-6">
          <p className="text-xs text-warning font-medium text-center">
            ⚠️ 密码无法找回，请务必牢记
          </p>
        </div>

        {/* Password form */}
        <div className="w-full max-w-[300px] space-y-4">

        <div className="space-y-4 flex-1">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="设置密码（8-32位，含字母和数字）"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="h-14 pr-12"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="再次确认密码"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            className="h-14"
          />

          <label className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-accent"
            />
            <span className="text-sm text-foreground">
              我已保存密码，理解密码无法找回
            </span>
          </label>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        </div>
      </div>

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleBackup}
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Cloud className="w-5 h-5 mr-2" />
          )}
          备份到 iCloud
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-14 text-base text-muted-foreground"
          onClick={handleSkipClick}
        >
          稍后备份
        </Button>
        <p className="text-xs text-center text-destructive">
          未完成备份将严格限制转账额度
        </p>
      </div>

      {/* Skip Warning Dialog */}
      <AlertDialog open={showSkipWarning} onOpenChange={setShowSkipWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertTriangle className="w-5 h-5" />
              <AlertDialogTitle>确定要跳过备份吗？</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-foreground font-medium">不完成备份将导致：</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>转账功能被严格限制</li>
                  <li>手机丢失或损坏时无法找回资产</li>
                  <li>无法在新设备上恢复钱包</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel className="w-full h-12 mt-0">
              我再想想
            </AlertDialogCancel>
            <AlertDialogAction 
              className="w-full h-12 bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={handleConfirmSkip}
            >
              我已了解风险，稍后备份
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ==================== RECOVERY FLOW ====================

// Recovery Step 1: Choose Recovery Method
function RecoveryMethodStep({ onComplete }: { onComplete: () => void }) {
  const [selectedMethod, setSelectedMethod] = useState<'scan' | 'cloud' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <CloudDownload className="w-10 h-10 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          恢复资产保险箱
        </h2>
        <p className="text-muted-foreground text-sm max-w-[260px] mb-6">
          选择一种方式恢复您的钱包
        </p>

        <div className="w-full max-w-[300px] space-y-3">
          <button
            onClick={() => setSelectedMethod('scan')}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-colors',
              selectedMethod === 'scan' 
                ? 'border-accent bg-accent/5' 
                : 'border-border bg-card hover:border-accent/50'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <QrCode className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">扫码恢复</p>
              <p className="text-sm text-muted-foreground">使用旧手机扫码授权</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod('cloud')}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-colors',
              selectedMethod === 'cloud' 
                ? 'border-accent bg-accent/5' 
                : 'border-border bg-card hover:border-accent/50'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Cloud className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">从云端恢复</p>
              <p className="text-sm text-muted-foreground">iCloud / Google Drive</p>
            </div>
          </button>
        </div>
      </div>

      <div className="pb-8">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          disabled={!selectedMethod}
          onClick={onComplete}
        >
          继续
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 2: Restore Data
function RecoveryDataStep({ onComplete }: { onComplete: () => void }) {
  const [source, setSource] = useState<'icloud' | 'google_drive' | 'file' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRestore = async () => {
    if (!password) {
      setError('请输入备份密码');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate restoration
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete();
    } catch (error) {
      setError('密码错误或备份文件损坏');
    } finally {
      setIsLoading(false);
    }
  };

  if (!source) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col h-full"
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            选择备份来源
          </h2>
          <p className="text-muted-foreground text-sm max-w-[260px] mb-6">
            选择您的备份存储位置
          </p>

          <div className="w-full max-w-[300px] space-y-3">
            <button
              onClick={() => setSource('icloud')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Cloud className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">iCloud</p>
                <p className="text-sm text-muted-foreground">从 iCloud 恢复</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setSource('google_drive')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Cloud className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Google Drive</p>
                <p className="text-sm text-muted-foreground">从 Google Drive 恢复</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setSource('file')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileDown className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">本地文件</p>
                <p className="text-sm text-muted-foreground">选择备份文件</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full pt-8"
    >
      <h2 className="text-xl font-bold text-foreground mb-2">
        输入备份密码
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        请输入您创建备份时设置的密码
      </p>

      <div className="space-y-4 flex-1">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="备份密码"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="h-14 pr-12"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleRestore}
          disabled={isLoading || !password}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : null}
          恢复数据
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-14 text-base text-muted-foreground"
          onClick={() => {
            setSource(null);
            setPassword('');
            setError('');
          }}
        >
          返回
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 3: Verify Identity
function RecoveryVerifyStep({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { enableBiometric } = useWallet();

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await enableBiometric();
      onComplete();
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Fingerprint className="w-10 h-10 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          验证您的身份
        </h2>
        <p className="text-muted-foreground text-sm max-w-[260px]">
          使用生物识别完成身份验证
        </p>
      </div>

      <div className="pb-8">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Fingerprint className="w-5 h-5 mr-2" />
          )}
          开始验证
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 4: Complete
function RecoveryCompleteStep({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-success" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          恢复完成
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] mb-8">
          您的钱包已成功恢复，所有资产均可正常使用
        </p>

        <div className="w-full max-w-[300px] space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm text-foreground">资产保险箱已恢复</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm text-foreground">安全设置已同步</span>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={onComplete}
        >
          进入钱包
        </Button>
      </div>
    </motion.div>
  );
}
