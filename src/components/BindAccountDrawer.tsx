import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { CountryCodeSelector, countries, type Country } from './CountryCodeSelector';
import { cn } from '@/lib/utils';

type BindType = 'email' | 'phone';
type BindStep = 'input' | 'verification' | 'success';

interface BindAccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: BindType;
  onSuccess?: (value: string) => void;
}

export function BindAccountDrawer({
  open,
  onOpenChange,
  type,
  onSuccess
}: BindAccountDrawerProps) {
  const [step, setStep] = useState<BindStep>('input');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

  const isEmail = type === 'email';
  const title = isEmail ? '绑定邮箱' : '绑定手机号';
  const placeholder = isEmail ? '请输入邮箱地址' : '请输入手机号';
  const Icon = isEmail ? Mail : Phone;

  const handleSendCode = async () => {
    if (!value) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep('verification');
    setCountdown(60);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async (inputCode: string) => {
    if (inputCode.length !== 6) return;
    
    setIsLoading(true);
    setCodeError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock: accept any 6-digit code
    if (inputCode === '123456' || inputCode.length === 6) {
      setStep('success');
      setTimeout(() => {
        const fullValue = isEmail ? value : `${selectedCountry.dialCode} ${value}`;
        onSuccess?.(fullValue);
        handleClose();
      }, 1500);
    } else {
      setCodeError('验证码错误');
      setCode('');
    }
    
    setIsLoading(false);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setCodeError('');
    if (newCode.length === 6) {
      handleVerifyCode(newCode);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep('input');
      setValue('');
      setCode('');
      setCodeError('');
      setCountdown(0);
    }, 300);
  };

  const handleBack = () => {
    if (step === 'verification') {
      setStep('input');
      setCode('');
      setCodeError('');
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            {step === 'verification' && (
              <button onClick={handleBack} className="text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <DrawerTitle>{title}</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="px-4 py-6">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                </div>

                {/* Input */}
                {isEmail ? (
                  <Input
                    type="email"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-14 text-base"
                  />
                ) : (
                  <div className="flex">
                    <CountryCodeSelector
                      selectedCountry={selectedCountry}
                      onSelect={setSelectedCountry}
                    />
                    <Input
                      type="tel"
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                      className="h-14 text-base rounded-l-none flex-1"
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  {isEmail 
                    ? '我们将发送验证码到您的邮箱'
                    : '我们将发送验证码到您的手机'
                  }
                </p>

                <Button
                  className="w-full h-12"
                  onClick={handleSendCode}
                  disabled={isLoading || !value}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '发送验证码'
                  )}
                </Button>
              </motion.div>
            )}

            {step === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">验证码已发送至</p>
                  <p className="font-medium text-foreground">
                    {isEmail ? value : `${selectedCountry.dialCode} ${value}`}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className={cn(
                            "w-11 h-12 text-lg",
                            codeError && "border-destructive"
                          )}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {codeError && (
                  <p className="text-sm text-destructive text-center">{codeError}</p>
                )}

                <div className="text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0 || isLoading}
                    className={cn(
                      "text-sm",
                      countdown > 0 ? "text-muted-foreground" : "text-primary hover:underline"
                    )}
                  >
                    {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送验证码'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </motion.div>
                <p className="text-lg font-semibold text-foreground">绑定成功</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEmail ? value : `${selectedCountry.dialCode} ${value}`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default BindAccountDrawer;
