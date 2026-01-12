import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Fingerprint, Lock, CloudUpload, 
  CheckCircle2, Loader2, ChevronRight, Eye, EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: '安全验证', icon: Fingerprint },
  { id: 2, title: '设置 PIN', icon: Lock },
  { id: 3, title: '创建钱包', icon: Shield },
  { id: 4, title: '备份保险箱', icon: CloudUpload },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { 
    enableBiometric, setPin, createWallet, 
    completeCloudBackup, hasBiometric, hasPin 
  } = useWallet();

  const progress = (currentStep / steps.length) * 100;

  const handleStepComplete = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            步骤 {currentStep} / {steps.length}
          </span>
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
        </AnimatePresence>
      </div>
    </div>
  );
}

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
