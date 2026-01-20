import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle2, Building2,
  ArrowRight, Search, ChevronRight, Star,
  FileText, Clock, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from '@/contexts/WalletContext';
import { PSPProvider } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
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
    isVerified: true,
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
  {
    id: 'psp-5',
    name: 'GlobalLink',
    logo: '',
    description: '企业级跨境支付平台，专注B2B大额交易',
    officialUrl: 'https://globallink.example.com',
    isVerified: true,
    rating: 4.7,
    contact: {
      email: 'business@globallink.com',
      phone: '+86 400-999-8888',
      supportUrl: 'https://globallink.example.com/support',
    },
    feeConfig: {
      collection: 0.35,
      withdrawal: 0.7,
      transfer: 0.2,
      minWithdrawal: 500,
    },
    availableServices: ['collection', 'transfer', 'withdrawal', 'settlement'],
  },
  {
    id: 'psp-6',
    name: 'QuickRemit',
    logo: '',
    description: '个人汇款专家，支持实时到账',
    officialUrl: 'https://quickremit.example.com',
    isVerified: true,
    rating: 4.4,
    contact: {
      email: 'help@quickremit.com',
      phone: '+86 400-222-3333',
    },
    feeConfig: {
      collection: 0.45,
      withdrawal: 0.85,
      transfer: 0.28,
      minWithdrawal: 30,
    },
    availableServices: ['transfer', 'withdrawal'],
  },
  {
    id: 'psp-7',
    name: 'PayEase',
    logo: '',
    description: '便捷支付解决方案，覆盖东南亚市场',
    officialUrl: 'https://payease.example.com',
    isVerified: false,
    rating: 4.1,
    contact: {
      email: 'support@payease.com',
      phone: '+65 6000-8888',
    },
    feeConfig: {
      collection: 0.5,
      withdrawal: 1.0,
      transfer: 0.32,
      minWithdrawal: 50,
    },
    availableServices: ['collection', 'transfer', 'deposit'],
  },
  {
    id: 'psp-8',
    name: 'EuroTransfer',
    logo: '',
    description: '欧洲专线支付，支持SEPA即时转账',
    officialUrl: 'https://eurotransfer.example.com',
    isVerified: true,
    rating: 4.6,
    contact: {
      email: 'info@eurotransfer.com',
      phone: '+49 30 12345678',
      supportUrl: 'https://eurotransfer.example.com/help',
    },
    feeConfig: {
      collection: 0.3,
      withdrawal: 0.6,
      transfer: 0.15,
      minWithdrawal: 100,
    },
    availableServices: ['collection', 'transfer', 'withdrawal', 'settlement'],
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

type FlowStep = 'list' | 'permissions' | 'application' | 'submitted';

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
  const [applicationNote, setApplicationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter PSPs by search query and exclude already connected
  const connectedIds = pspConnections?.map(c => c.psp.id) || [];
  const filteredPSPs = availablePSPs.filter(psp => {
    const matchesSearch = psp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      psp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const notConnected = !connectedIds.includes(psp.id);
    return matchesSearch && notConnected;
  });

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

  // Proceed to application form
  const handleProceedToApplication = () => {
    setCurrentStep('application');
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!selectedPSP) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Connect PSP with pending status
      await connectPSP(selectedPSP, permissions);
      
      setCurrentStep('submitted');
    } catch (error) {
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'permissions':
        setSelectedPSP(null);
        setCurrentStep('list');
        break;
      case 'application':
        setCurrentStep('permissions');
        break;
      case 'submitted':
        navigate('/psp');
        break;
      default:
        navigate(-1);
    }
  };

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

            {/* Info Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-3 rounded-xl bg-muted/50 flex items-start gap-3"
            >
              <FileText className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">申请说明</p>
                <p>选择服务商后，您需要提交连接申请。服务商将在1-3个工作日内审核您的申请。</p>
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
                  <h4 className="text-sm font-medium text-foreground mb-3">申请授权权限</h4>
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
                  onClick={handleProceedToApplication}
                >
                  下一步
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        );

      case 'application':
        return (
          <div className="px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">提交连接申请</h2>
                <p className="text-sm text-muted-foreground">
                  向 {selectedPSP?.name} 提交连接申请
                </p>
              </div>

              {/* Application Summary */}
              {selectedPSP && (
                <div className="card-elevated p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <PSPLogo pspId={selectedPSP.id} pspName={selectedPSP.name} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{selectedPSP.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        申请 {Object.values(permissions).filter(Boolean).length} 项权限
                      </p>
                    </div>
                  </div>
                  
                  {/* Selected Permissions */}
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(permissions)
                      .filter(([_, enabled]) => enabled)
                      .map(([key]) => (
                        <span 
                          key={key}
                          className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs"
                        >
                          {permissionLabels[key]?.label}
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Application Note */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  申请备注 <span className="text-muted-foreground font-normal">(可选)</span>
                </label>
                <Textarea
                  placeholder="请简要说明您的业务场景或连接目的..."
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {applicationNote.length}/500
                </p>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground mb-0.5">审核说明</p>
                    <p className="text-muted-foreground">
                      提交申请后，服务商将在1-3个工作日内完成审核。审核通过后，您将收到通知并可开始使用相关服务。
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full h-12 gradient-primary"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    提交中...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交申请
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        );

      case 'submitted':
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
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
              >
                <Clock className="w-10 h-10 text-accent" />
              </motion.div>
              
              <h2 className="text-xl font-semibold text-foreground mb-2">申请已提交</h2>
              <p className="text-sm text-muted-foreground mb-6">
                您的连接申请已提交至 {selectedPSP?.name}，请等待审核
              </p>

              {selectedPSP && (
                <div className="card-elevated p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <PSPLogo pspId={selectedPSP.id} pspName={selectedPSP.name} />
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-foreground">{selectedPSP.name}</h3>
                      <p className="text-xs text-muted-foreground">预计1-3个工作日</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10">
                      <Clock className="w-3.5 h-3.5 text-warning" />
                      <span className="text-xs text-warning font-medium">待审核</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="card-elevated p-4 mb-6 text-left">
                <h4 className="text-sm font-medium text-foreground mb-3">审核流程</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-medium text-foreground">申请已提交</p>
                      <p className="text-xs text-muted-foreground">刚刚</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-muted-foreground">服务商审核中</p>
                      <p className="text-xs text-muted-foreground">预计1-3个工作日</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-muted-foreground">审核通过，连接生效</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-12"
                onClick={() => navigate('/psp')}
              >
                返回服务商列表
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
        return '选择权限';
      case 'application':
        return '提交申请';
      case 'submitted':
        return '申请已提交';
      default:
        return '添加服务商';
    }
  };

  return (
    <AppLayout 
      title={getTitle()}
      showBack={currentStep !== 'submitted'}
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
