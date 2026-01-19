import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle2, Building2,
  Lock, ArrowRight, Search, ChevronRight, Star
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

export default function PSPConnectPage() {
  const navigate = useNavigate();
  const { connectPSP, pspConnections } = useWallet();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [selectedPSP, setSelectedPSP] = useState<PSPProvider | null>(null);
  const [permissions, setPermissions] = useState({
    readBalance: true,
    readTransactions: true,
    collection: true,
    transfer: true,
    withdrawal: true,
  });
  const [isConnecting, setIsConnecting] = useState(false);

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
    setShowAuthDrawer(true);
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
    if (!selectedPSP) return;
    
    setIsConnecting(true);
    
    try {
      await connectPSP(selectedPSP, permissions);
      
      toast.success('连接成功', {
        description: `已成功连接 ${selectedPSP.name}`,
      });
      
      setShowAuthDrawer(false);
      navigate('/psp');
    } catch (error) {
      toast.error('连接失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <AppLayout 
      title="添加服务商" 
      showBack 
      onBack={() => navigate(-1)}
    >
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
                {/* PSP Logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0">
                  {psp.logo ? (
                    <img src={psp.logo} alt={psp.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-accent" />
                  )}
                </div>

                {/* PSP Info */}
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

                {/* Arrow */}
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
            {selectedPSP && (
              <>
                {/* PSP Info Card */}
                <div className="card-elevated p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      {selectedPSP.logo ? (
                        <img src={selectedPSP.logo} alt={selectedPSP.name} className="w-10 h-10" />
                      ) : (
                        <Building2 className="w-7 h-7 text-accent" />
                      )}
                    </div>
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
                      <p className="text-xs text-muted-foreground">{selectedPSP.description}</p>
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
