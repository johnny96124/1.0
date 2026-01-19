import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ScanLine, Keyboard, Link2, ChevronRight, 
  Shield, CheckCircle2, AlertCircle, Building2,
  Eye, EyeOff, Lock, ArrowRight
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

type ConnectMethod = 'scan' | 'code' | 'link';

// Mock PSP data for demo
const mockPSPInfo: PSPProvider = {
  id: 'psp-demo-1',
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
};

// Permission descriptions
const permissionLabels: Record<string, { label: string; desc: string }> = {
  readBalance: { label: '查看余额', desc: '允许服务商查看您的账户余额' },
  readTransactions: { label: '查看交易', desc: '允许服务商查看您的交易记录' },
  collection: { label: '收款服务', desc: '通过服务商渠道接收付款' },
  transfer: { label: '转账服务', desc: '通过服务商渠道发起转账' },
  withdrawal: { label: '出金服务', desc: '通过服务商渠道提现资金' },
};

export default function PSPConnectPage() {
  const navigate = useNavigate();
  const { connectPSP } = useWallet();
  
  const [method, setMethod] = useState<ConnectMethod>('code');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [pspInfo, setPspInfo] = useState<PSPProvider | null>(null);
  const [permissions, setPermissions] = useState({
    readBalance: true,
    readTransactions: true,
    collection: true,
    transfer: true,
    withdrawal: true,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle code verification
  const handleVerifyCode = async () => {
    if (authCode.length < 6) {
      toast.error('请输入有效的授权码');
      return;
    }

    setIsLoading(true);
    
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: show mock PSP info
    setPspInfo(mockPSPInfo);
    setShowAuthDrawer(true);
    setIsLoading(false);
  };

  // Handle permission toggle
  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  // Handle final connection
  const handleConnect = async () => {
    if (!pspInfo) return;
    
    setIsConnecting(true);
    
    try {
      await connectPSP(pspInfo, permissions);
      
      toast.success('连接成功', {
        description: `已成功连接 ${pspInfo.name}`,
      });
      
      setShowAuthDrawer(false);
      navigate('/psp');
    } catch (error) {
      toast.error('连接失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  const methods = [
    { id: 'scan' as ConnectMethod, icon: ScanLine, label: '扫码连接', desc: '扫描服务商提供的二维码' },
    { id: 'code' as ConnectMethod, icon: Keyboard, label: '授权码', desc: '输入服务商提供的授权码' },
    { id: 'link' as ConnectMethod, icon: Link2, label: '邀请链接', desc: '通过邀请链接直接连接' },
  ];

  return (
    <AppLayout 
      title="添加服务商" 
      showBack 
      onBack={() => navigate(-1)}
    >
      <div className="px-4 py-4">
        {/* Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-6"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3">选择连接方式</h2>
          {methods.map((m) => {
            const Icon = m.icon;
            const isActive = method === m.id;
            
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'w-full p-4 rounded-xl flex items-center gap-3 transition-all border',
                  isActive 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border bg-card hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isActive ? 'bg-accent/10' : 'bg-muted'
                )}>
                  <Icon className={cn('w-5 h-5', isActive ? 'text-accent' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn('font-medium text-sm', isActive ? 'text-foreground' : 'text-foreground/80')}>
                    {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isActive ? 'border-accent' : 'border-muted-foreground/30'
                )}>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Method Content */}
        <AnimatePresence mode="wait">
          {method === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="card-elevated p-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  输入授权码
                </label>
                <Input
                  placeholder="请输入 6-12 位授权码"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  授权码由服务商提供，通常为 6-12 位字母数字组合
                </p>
              </div>

              <Button 
                className="w-full h-12 gradient-accent"
                onClick={handleVerifyCode}
                disabled={authCode.length < 6 || isLoading}
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
                    验证授权码
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {method === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="card-elevated p-8 flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-2xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-4">
                  <ScanLine className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  点击下方按钮打开相机，扫描服务商提供的二维码
                </p>
              </div>

              <Button 
                className="w-full h-12 gradient-accent"
                onClick={() => {
                  // TODO: Implement QR scanner
                  toast.info('扫码功能即将上线');
                }}
              >
                <ScanLine className="w-4 h-4 mr-2" />
                打开扫码
              </Button>
            </motion.div>
          )}

          {method === 'link' && (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="card-elevated p-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  粘贴邀请链接
                </label>
                <Input
                  placeholder="https://..."
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  将服务商发送的邀请链接粘贴到上方输入框
                </p>
              </div>

              <Button 
                className="w-full h-12 gradient-accent"
                onClick={() => {
                  toast.info('链接连接功能即将上线');
                }}
              >
                解析链接
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Authorization Drawer */}
      <Drawer open={showAuthDrawer} onOpenChange={setShowAuthDrawer}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>确认连接</DrawerTitle>
            <DrawerDescription>
              请确认服务商信息并选择授权权限
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-8 overflow-y-auto">
            {pspInfo && (
              <>
                {/* PSP Info Card */}
                <div className="card-elevated p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      {pspInfo.logo ? (
                        <img src={pspInfo.logo} alt={pspInfo.name} className="w-10 h-10" />
                      ) : (
                        <Building2 className="w-7 h-7 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{pspInfo.name}</h3>
                        {pspInfo.isVerified && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10">
                            <Shield className="w-3 h-3 text-accent" />
                            <span className="text-xs text-accent font-medium">已认证</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{pspInfo.description}</p>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{pspInfo.feeConfig.collection}%</p>
                      <p className="text-xs text-muted-foreground">收款费率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{pspInfo.feeConfig.transfer}%</p>
                      <p className="text-xs text-muted-foreground">转账费率</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{pspInfo.feeConfig.withdrawal}%</p>
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

                {/* Connect Button */}
                <Button 
                  className="w-full h-12 gradient-primary"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      连接中...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      确认连接
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  连接后需要验证您的身份
                </p>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
