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
type OAuthProvider = 'google' | 'apple';
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
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [codeError, setCodeError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);

  const isEmail = type === 'email';
  const title = isEmail ? '绑定邮箱' : '绑定手机号';
  const placeholder = isEmail ? '请输入邮箱地址' : '请输入手机号';
  const Icon = isEmail ? Mail : Phone;

  const handleOAuthBind = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock OAuth success with email from provider
    const mockEmail = provider === 'google' 
      ? 'user@gmail.com' 
      : 'user@icloud.com';
    
    setOauthLoading(null);
    setStep('success');
    setValue(mockEmail);
    
    setTimeout(() => {
      onSuccess?.(mockEmail);
      handleClose();
    }, 1500);
  };

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
      setOauthLoading(null);
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

                {/* OAuth Options - Only for Email */}
                {isEmail && (
                  <div className="space-y-3">
                    {/* Google OAuth */}
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3"
                      onClick={() => handleOAuthBind('google')}
                      disabled={oauthLoading !== null || isLoading}
                    >
                      {oauthLoading === 'google' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      <span>使用 Google 账号绑定</span>
                    </Button>

                    {/* Apple OAuth */}
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3"
                      onClick={() => handleOAuthBind('apple')}
                      disabled={oauthLoading !== null || isLoading}
                    >
                      {oauthLoading === 'apple' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                      )}
                      <span>使用 Apple 账号绑定</span>
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-4 text-muted-foreground">
                          或手动输入邮箱
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input */}
                {isEmail ? (
                  <Input
                    type="email"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-12 text-base"
                  />
                ) : (
                  <div className="relative flex items-center h-12 rounded-md border border-input bg-background">
                    <CountryCodeSelector
                      selectedCountry={selectedCountry}
                      onSelect={setSelectedCountry}
                      className="border-0 bg-transparent h-full rounded-l-md hover:bg-muted/50"
                    />
                    <div className="w-px h-6 bg-border" />
                    <input
                      type="tel"
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 h-full px-3 text-base bg-transparent outline-none placeholder:text-muted-foreground"
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
                  disabled={isLoading || !value || oauthLoading !== null}
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
