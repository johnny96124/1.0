import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Fingerprint, Lock, CloudUpload, CloudDownload,
  CheckCircle2, Loader2, ChevronRight, Eye, EyeOff,
  AlertTriangle, Smartphone, QrCode, FileDown, ArrowLeft,
  Cloud, HardDrive, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

// Create wallet steps
const createSteps = [
  { id: 1, title: '安全验证', icon: Fingerprint },
  { id: 2, title: '设置 PIN', icon: Lock },
  { id: 3, title: '创建钱包', icon: Shield },
  { id: 4, title: '备份保险箱', icon: CloudUpload },
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
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="px-6 pt-6 pb-4">
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
      <div className="flex-1 px-6">
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
            // Create Wallet Flow
            <>
              {currentStep === 1 && (
                <BiometricStep key="biometric" onComplete={handleStepComplete} />
              )}
              {currentStep === 2 && (
                <PinStep key="pin" onComplete={handleStepComplete} />
              )}
              {currentStep === 3 && (
                <CreateWalletStep key="create" onComplete={handleStepComplete} />
              )}
              {currentStep === 4 && (
                <BackupStep key="backup" onComplete={handleStepComplete} />
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== CREATE WALLET FLOW ====================

// Step 1: Biometric
function BiometricStep({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { enableBiometric } = useWallet();

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      await enableBiometric();
      onComplete();
    } catch (error) {
      console.error('Biometric failed:', error);
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
          className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Fingerprint className="w-12 h-12 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          开启生物识别验证
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          为了保护资金安全，请开启面容 ID 或指纹验证
        </p>
      </div>

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleEnable}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Fingerprint className="w-5 h-5 mr-2" />
          )}
          开启生物识别
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-14 text-base text-muted-foreground"
          onClick={onComplete}
        >
          暂时跳过
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          不开启将无法使用转账功能
        </p>
      </div>
    </motion.div>
  );
}

// Step 2: PIN
function PinStep({ onComplete }: { onComplete: () => void }) {
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPin } = useWallet();

  const handlePinInput = (value: string) => {
    if (value.length <= 6) {
      if (step === 'enter') {
        setPinValue(value);
        setError('');
        if (value.length === 6) {
          setTimeout(() => setStep('confirm'), 300);
        }
      } else {
        setConfirmPin(value);
        setError('');
        if (value.length === 6) {
          if (value === pin) {
            handleComplete(value);
          } else {
            setError('PIN 不匹配，请重试');
            setConfirmPin('');
          }
        }
      }
    }
  };

  const handleComplete = async (finalPin: string) => {
    setIsLoading(true);
    try {
      await setPin(finalPin);
      onComplete();
    } catch (error) {
      setError('设置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

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
          className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Lock className="w-12 h-12 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          {step === 'enter' ? '设置 6 位 PIN 码' : '再次确认 PIN 码'}
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          PIN 用于关键操作确认，如转账和恢复
        </p>

        {/* PIN Display */}
        <div className="flex gap-3 mt-8 mb-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: currentPin.length > i ? 1.1 : 1,
                backgroundColor: currentPin.length > i ? 'hsl(var(--accent))' : 'hsl(var(--muted))'
              }}
              className="w-4 h-4 rounded-full"
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive flex items-center gap-1"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </div>

      {/* Number Pad */}
      <div className="pb-8">
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num, i) => (
            <Button
              key={i}
              variant="ghost"
              className={cn(
                'h-16 text-2xl font-medium rounded-xl',
                num === '' && 'invisible'
              )}
              onClick={() => {
                if (num === '⌫') {
                  handlePinInput(currentPin.slice(0, -1));
                } else if (num !== '') {
                  handlePinInput(currentPin + num);
                }
              }}
              disabled={isLoading}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Step 3: Create Wallet
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

// Step 4: Backup
function BackupStep({ onComplete }: { onComplete: () => void }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
      onComplete();
    } catch (error) {
      setError('备份失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPasswordForm) {
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
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
          >
            <CloudUpload className="w-12 h-12 text-success" />
          </motion.div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            请完成"资产保险箱"备份
          </h2>
          <p className="text-muted-foreground text-sm max-w-[280px] mb-4">
            用于换机或手机丢失时找回资金
          </p>

          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 max-w-[300px]">
            <p className="text-sm text-warning font-medium">
              ⚠️ 我们无法替您找回保险箱密码，请务必牢记
            </p>
          </div>
        </div>

        <div className="pb-8 space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => setShowPasswordForm(true)}
          >
            <CloudUpload className="w-5 h-5 mr-2" />
            云备份（推荐）
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-medium"
            onClick={() => setShowPasswordForm(true)}
          >
            导出备份文件（高级）
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-14 text-base text-muted-foreground"
            onClick={onComplete}
          >
            稍后备份
          </Button>
          <p className="text-xs text-center text-destructive">
            未完成备份将严格限制转账额度
          </p>
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
        设置保险箱密码
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        此密码将用于加密您的备份，请牢记
      </p>

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

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleBackup}
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : null}
          完成备份
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-14 text-base text-muted-foreground"
          onClick={() => setShowPasswordForm(false)}
        >
          返回
        </Button>
      </div>
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
          className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <CloudDownload className="w-12 h-12 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          在新设备上继续使用
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] mb-8">
          选择恢复方式，两种方式都不会泄露密钥
        </p>

        {/* Recovery Options */}
        <div className="w-full space-y-3 max-w-sm">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setSelectedMethod('scan')}
            className={cn(
              'w-full p-4 rounded-2xl border-2 text-left transition-all',
              selectedMethod === 'scan' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">旧设备在身边</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">推荐</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  使用旧设备扫码授权，最快最安全
                </p>
              </div>
              {selectedMethod === 'scan' && (
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              )}
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setSelectedMethod('cloud')}
            className={cn(
              'w-full p-4 rounded-2xl border-2 text-left transition-all',
              selectedMethod === 'cloud' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Cloud className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">旧设备不可用</p>
                <p className="text-sm text-muted-foreground mt-1">
                  通过云备份或备份文件恢复
                </p>
              </div>
              {selectedMethod === 'cloud' && (
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              )}
            </div>
          </motion.button>
        </div>
      </div>

      <div className="pb-8">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={onComplete}
          disabled={!selectedMethod}
        >
          继续
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 2: Restore Data (Cloud/File)
function RecoveryDataStep({ onComplete }: { onComplete: () => void }) {
  const [source, setSource] = useState<'icloud' | 'google' | 'file' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const backupSources = [
    { 
      id: 'icloud' as const, 
      name: 'iCloud', 
      icon: Cloud,
      lastBackup: '2024-01-10 14:30',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      id: 'google' as const, 
      name: 'Google Drive', 
      icon: Cloud,
      lastBackup: '2024-01-08 09:15',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      id: 'file' as const, 
      name: '导入备份文件', 
      icon: Upload,
      lastBackup: null,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
  ];

  const handleRestore = async () => {
    if (!password) {
      setError('请输入保险箱密码');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock: password validation
    if (password !== 'test1234') {
      setRetryCount(prev => prev + 1);
      if (retryCount >= 4) {
        setError('尝试次数过多，请 1 小时后再试或联系客服');
      } else {
        setError(`保险箱密码错误（剩余 ${4 - retryCount} 次尝试）`);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onComplete();
  };

  if (!source) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col h-full pt-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-2">
          选择备份来源
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          我们找到了您的云端备份
        </p>

        <div className="space-y-3 flex-1">
          {backupSources.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSource(item.id)}
                className="w-full p-4 rounded-2xl border border-border hover:border-accent/50 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', item.bgColor)}>
                    <Icon className={cn('w-6 h-6', item.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.lastBackup && (
                      <p className="text-sm text-muted-foreground">
                        上次备份：{item.lastBackup}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="pb-8">
          <p className="text-xs text-center text-muted-foreground">
            找不到备份？请检查是否登录了正确的账号
          </p>
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
        输入保险箱密码
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        请输入您创建钱包时设置的保险箱密码
      </p>

      <div className="space-y-4 flex-1">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入保险箱密码"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="h-14 pr-12"
            autoFocus
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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          </motion.div>
        )}

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">
            💡 密码是您在首次创建钱包时设置的"资产保险箱密码"，用于加密保护您的备份数据。
          </p>
        </div>
      </div>

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleRestore}
          disabled={isLoading || !password || retryCount >= 5}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在验证...
            </>
          ) : (
            '确认恢复'
          )}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full h-14 text-base text-muted-foreground"
          onClick={() => setSource(null)}
          disabled={isLoading}
        >
          返回选择备份
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 3: Verify Identity (Passkey/Biometric)
function RecoveryVerifyStep({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { enableBiometric } = useWallet();

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await enableBiometric();
      // Simulate key regeneration
      await new Promise(resolve => setTimeout(resolve, 1500));
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
          className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          <Fingerprint className="w-12 h-12 text-accent" />
        </motion.div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          验证身份
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] mb-4">
          请使用面容 ID 或指纹完成身份验证
        </p>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          验证通过后，系统将为此设备生成新的安全凭证
        </p>
      </div>

      <div className="pb-8 space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium"
          onClick={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              正在验证...
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 mr-2" />
              开始验证
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// Recovery Step 4: Complete
function RecoveryCompleteStep({ onComplete }: { onComplete: () => void }) {
  const [disableOldDevice, setDisableOldDevice] = useState(true);
  const navigate = useNavigate();

  const handleComplete = async () => {
    // TODO: If disableOldDevice is true, mark old device as lost
    onComplete();
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-success" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-foreground mb-2"
        >
          钱包恢复成功！
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm max-w-[280px] mb-8"
        >
          您的钱包已在此设备上成功恢复
        </motion.p>

        {/* Security Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <label className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={disableOldDevice}
              onChange={(e) => setDisableOldDevice(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-warning"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                禁用旧设备
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                建议将旧设备标记为丢失并禁用其访问权限
              </p>
            </div>
          </label>
        </motion.div>
      </div>

      <div className="pb-8">
        <Button
          size="lg"
          className="w-full h-14 text-base font-medium bg-success hover:bg-success/90 text-success-foreground"
          onClick={handleComplete}
        >
          进入钱包
        </Button>
      </div>
    </motion.div>
  );
}
