import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle2, Building2,
  Lock, ArrowRight, Search, ChevronRight, Star,
  Smartphone, Mail, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { PSPProvider } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerDescription 
} from '@/components/ui/drawer';
import { Checkbox } from '@/components/ui/checkbox';
import { PSPLogo } from '@/components/PSPLogo';

// Mock available PSPs list
const availablePSPs: PSPProvider[] = [
  {
    id: 'psp-1',
    name: 'PayGlobal',
    logo: '',
    description: '全球领先的跨境支付服务商，提供安全、快速的支付解决方案',
    officialUrl: 'https://payglobal.example.com',
    isVerified: true,
    rating: 4.8,
    contact: {
      email: 'support@payglobal.com',
      phone: '+86 400-888-8888',
      supportUrl: 'https://payglobal.example.com/support',
    },
    feeConfig: {
      collection: 0.5,
      withdrawal: 1.0,
      transfer: 0.3,
      minWithdrawal: 100,
    },
    availableServices: ['collection', 'transfer', 'withdrawal', 'deposit'],
  },
  {
    id: 'psp-2',
    name: 'FastPay Asia',
    logo: '',
    description: '亚洲区域专业支付服务商，专注亚太地区跨境业务',
    officialUrl: 'https://fastpay.example.com',
    isVerified: true,
    rating: 4.6,
    contact: {
      email: 'support@fastpay.com',
      phone: '+86 400-666-6666',
      supportUrl: 'https://fastpay.example.com/support',
    },
    feeConfig: {
      collection: 0.4,
      withdrawal: 0.8,
      transfer: 0.25,
      minWithdrawal: 50,
    },
    availableServices: ['collection', 'transfer', 'withdrawal'],
  },
  {
    id: 'psp-3',
    name: 'UniPay',
    logo: '',
    description: '一站式全球支付解决方案，支持200+国家和地区',
    officialUrl: 'https://unipay.example.com',
    isVerified: true,
    rating: 4.5,
    contact: {
      email: 'support@unipay.com',
      phone: '+86 400-555-5555',
      supportUrl: 'https://unipay.example.com/support',
    },
    feeConfig: {
      collection: 0.6,
      withdrawal: 1.2,
      transfer: 0.35,
      minWithdrawal: 100,
    },
    availableServices: ['collection', 'transfer', 'withdrawal', 'deposit'],
  },
  {
    id: 'psp-4',
    name: 'CrossBorder Pay',
    logo: '',
    description: '专业跨境电商支付服务，高效便捷的结算体验',
    officialUrl: 'https://crossborderpay.example.com',
    isVerified: false,
    rating: 4.2,
    contact: {
      email: 'support@cbpay.com',
      phone: '+86 400-333-3333',
      supportUrl: 'https://crossborderpay.example.com/support',
    },
    feeConfig: {
      collection: 0.55,
      withdrawal: 0.9,
      transfer: 0.3,
      minWithdrawal: 80,
    },
    availableServices: ['collection', 'transfer'],
  },
];

// Permission descriptions
const permissionLabels: Record<string, { label: string; desc: string }> = {
  readBalance: { label: '查看余额', desc: '允许服务商查看您的账户余额' },
  readTransactions: { label: '查看交易', desc: '允许服务商查看您的交易记录' },
  collection: { label: '收款服务', desc: '通过服务商渠道接收付款' },
  transfer: { label: '转账服务', desc: '通过服务商渠道发起转账' },
  withdrawal: { label: '出金服务', desc: '通过服务商渠道提现资金' },
};

type VerificationMethod = 'phone' | 'email';
type FlowStep = 'list' | 'permissions' | 'verify-method' | 'verify-code' | 'success';

export default function PSPConnectPage() {
  const navigate = useNavigate();
  const { connectPSP, pspConnections } = useWallet();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPSP, setSelectedPSP] = useState<PSPProvider | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('list');
  const [permissions, setPermissions] = useState({
    readBalance: true,
    readTransactions: true,
    collection: true,
    transfer: true,
    withdrawal: true,
  });
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('phone');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter PSPs by search query and exclude already connected
  const connectedIds = pspConnections?.map(c => c.psp.id) || [];
  const filteredPSPs = availablePSPs.filter(psp => {
    const matchesSearch = psp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      psp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const notConnected = !connectedIds.includes(psp.id);
    return matchesSearch && notConnected;
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle PSP selection
  const handleSelectPSP = (psp: PSPProvider) => {
    setSelectedPSP(psp);
    setCurrentStep('permissions');
  };

  // Handle permission toggle
  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  // Proceed to verification method selection
  const handleProceedToVerify = () => {
    setCurrentStep('verify-method');
  };

  // Send verification code
  const handleSendCode = async () => {
    setIsLoading(true);
    // Simulate sending code
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setCountdown(60);
    setCurrentStep('verify-code');
    toast.success('验证码已发送', {
      description: verificationMethod === 'phone' ? '请查看您的手机短信' : '请查看您的邮箱',
    });
  };

  // Handle OTP input
  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify code and complete connection
  const handleVerifyAndConnect = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('请输入完整的验证码');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Connect PSP
      if (selectedPSP) {
        await connectPSP(selectedPSP, permissions);
      }
      
      setCurrentStep('success');
    } catch (error) {
      toast.error('验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'permissions':
        setSelectedPSP(null);
        setCurrentStep('list');
        break;
      case 'verify-method':
        setCurrentStep('permissions');
        break;
      case 'verify-code':
        setVerificationCode(['', '', '', '', '', '']);
        setCurrentStep('verify-method');
        break;
      default:
        navigate(-1);
    }
  };

  // Get masked contact info
  const getMaskedPhone = () => '138****8888';
  const getMaskedEmail = () => 'u***@example.com';

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'list':
        return (
          <div className="px-4 py-4">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索服务商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* PSP List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                可用服务商 ({filteredPSPs.length})
              </h2>
              
              {filteredPSPs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">未找到匹配的服务商</p>
                </div>
              ) : (
                filteredPSPs.map((psp, index) => (
                  <motion.button
                    key={psp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectPSP(psp)}
                    className="w-full card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <PSPLogo pspId={psp.id} pspName={psp.name} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-foreground text-sm truncate">{psp.name}</h3>
                        {psp.isVerified && (
                          <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{psp.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-xs text-muted-foreground">{psp.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">收款 {psp.feeConfig.collection}%</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.button>
                ))
              )}
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-3 rounded-xl bg-muted/50 flex items-start gap-3"
            >
              <Shield className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">安全提示</p>
                <p>仅连接您信任的服务商。连接后，您可以随时在服务商详情页管理权限或解除连接。</p>
              </div>
            </motion.div>
          </div>
        );

      case 'permissions':
        return (
          <div className="px-4 py-4">
            {selectedPSP && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* PSP Info Card */}
                <div className="card-elevated p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <PSPLogo pspId={selectedPSP.id} pspName={selectedPSP.name} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{selectedPSP.name}</h3>
                        {selectedPSP.isVerified && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10">
                            <Shield className="w-3 h-3 text-accent" />
                            <span className="text-xs text-accent font-medium">已认证</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedPSP.description}</p>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{selectedPSP.feeConfig.collection}%</p>
                      <p className="text-xs text-muted-foreground">收款费率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{selectedPSP.feeConfig.transfer}%</p>
                      <p className="text-xs text-muted-foreground">转账费率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{selectedPSP.feeConfig.withdrawal}%</p>
                      <p className="text-xs text-muted-foreground">出金费率</p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">授权权限</h4>
                  <div className="space-y-2">
                    {Object.entries(permissionLabels).map(([key, { label, desc }]) => (
                      <button
                        key={key}
                        onClick={() => togglePermission(key)}
                        className="w-full p-3 rounded-xl bg-card border border-border flex items-center gap-3 text-left"
                      >
                        <Checkbox 
                          checked={permissions[key as keyof typeof permissions]}
                          onCheckedChange={() => togglePermission(key)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  className="w-full h-12 gradient-primary"
                  onClick={handleProceedToVerify}
                >
                  继续
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        );

      case 'verify-method':
        return (
          <div className="px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">身份验证</h2>
              <p className="text-sm text-muted-foreground">
                为保护您的账户安全，请选择验证方式
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3 mb-6"
            >
              {/* Phone Verification */}
              <button
                onClick={() => setVerificationMethod('phone')}
                className={cn(
                  'w-full p-4 rounded-xl border flex items-center gap-4 transition-all',
                  verificationMethod === 'phone'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  verificationMethod === 'phone' ? 'bg-accent/10' : 'bg-muted'
                )}>
                  <Smartphone className={cn(
                    'w-6 h-6',
                    verificationMethod === 'phone' ? 'text-accent' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">手机短信验证</p>
                  <p className="text-sm text-muted-foreground">{getMaskedPhone()}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  verificationMethod === 'phone' ? 'border-accent' : 'border-muted-foreground/30'
                )}>
                  {verificationMethod === 'phone' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
              </button>

              {/* Email Verification */}
              <button
                onClick={() => setVerificationMethod('email')}
                className={cn(
                  'w-full p-4 rounded-xl border flex items-center gap-4 transition-all',
                  verificationMethod === 'email'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  verificationMethod === 'email' ? 'bg-accent/10' : 'bg-muted'
                )}>
                  <Mail className={cn(
                    'w-6 h-6',
                    verificationMethod === 'email' ? 'text-accent' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">邮箱验证</p>
                  <p className="text-sm text-muted-foreground">{getMaskedEmail()}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  verificationMethod === 'email' ? 'border-accent' : 'border-muted-foreground/30'
                )}>
                  {verificationMethod === 'email' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
              </button>
            </motion.div>

            <Button 
              className="w-full h-12 gradient-primary"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  发送中...
                </span>
              ) : (
                <>
                  发送验证码
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        );

      case 'verify-code':
        return (
          <div className="px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                {verificationMethod === 'phone' ? (
                  <Smartphone className="w-8 h-8 text-accent" />
                ) : (
                  <Mail className="w-8 h-8 text-accent" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">输入验证码</h2>
              <p className="text-sm text-muted-foreground">
                验证码已发送至 {verificationMethod === 'phone' ? getMaskedPhone() : getMaskedEmail()}
              </p>
            </motion.div>

            {/* OTP Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center gap-2 mb-6"
            >
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    'w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all',
                    'bg-card focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
                    digit ? 'border-accent' : 'border-border'
                  )}
                />
              ))}
            </motion.div>

            {/* Resend */}
            <div className="text-center mb-6">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {countdown} 秒后可重新发送
                </p>
              ) : (
                <button
                  onClick={handleSendCode}
                  className="text-sm text-accent font-medium hover:underline"
                >
                  重新发送验证码
                </button>
              )}
            </div>

            <Button 
              className="w-full h-12 gradient-primary"
              onClick={handleVerifyAndConnect}
              disabled={isLoading || verificationCode.join('').length !== 6}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  验证中...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  确认连接
                </>
              )}
            </Button>
          </div>
        );

      case 'success':
        return (
          <div className="px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              
              <h2 className="text-xl font-semibold text-foreground mb-2">连接成功</h2>
              <p className="text-sm text-muted-foreground mb-6">
                已成功连接 {selectedPSP?.name}，您现在可以使用该服务商的服务
              </p>

              {selectedPSP && (
                <div className="card-elevated p-4 mb-6 flex items-center gap-3">
                  <PSPLogo pspId={selectedPSP.id} pspName={selectedPSP.name} />
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">{selectedPSP.name}</h3>
                    <p className="text-xs text-muted-foreground">已连接</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs text-success font-medium">已验证</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-12"
                onClick={() => navigate('/psp')}
              >
                完成
              </Button>
            </motion.div>
          </div>
        );
    }
  };

  // Get title based on step
  const getTitle = () => {
    switch (currentStep) {
      case 'list':
        return '添加服务商';
      case 'permissions':
        return '授权权限';
      case 'verify-method':
      case 'verify-code':
        return '身份验证';
      case 'success':
        return '连接成功';
      default:
        return '添加服务商';
    }
  };

  return (
    <AppLayout 
      title={getTitle()}
      showBack={currentStep !== 'success'}
      onBack={handleBack}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
