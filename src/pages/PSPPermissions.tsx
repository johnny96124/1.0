import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Eye, FileText, QrCode, Send, 
  ArrowDownToLine, Info
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

import { Switch } from '@/components/ui/switch';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { PSPLogo } from '@/components/PSPLogo';

// Permission configuration
const permissionConfig = [
  { 
    key: 'readBalance', 
    icon: Eye, 
    label: '查看余额', 
    desc: '允许服务商查看您的账户余额',
    required: true 
  },
  { 
    key: 'readTransactions', 
    icon: FileText, 
    label: '查看交易', 
    desc: '允许服务商查看您的交易记录',
    required: true 
  },
  { 
    key: 'collection', 
    icon: QrCode, 
    label: '收款服务', 
    desc: '通过服务商渠道接收付款',
    required: false 
  },
  { 
    key: 'transfer', 
    icon: Send, 
    label: '转账服务', 
    desc: '通过服务商渠道发起转账',
    required: false 
  },
  { 
    key: 'withdrawal', 
    icon: ArrowDownToLine, 
    label: '出金服务', 
    desc: '通过服务商渠道提现资金',
    required: false 
  },
] as const;

export default function PSPPermissionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pspConnections } = useWallet();
  
  // Find the connection
  const connection = useMemo(() => {
    return pspConnections?.find(c => c.id === id);
  }, [pspConnections, id]);

  // Local state for permissions (would be synced with backend in real app)
  const [permissions, setPermissions] = useState(connection?.permissions || {
    readBalance: true,
    readTransactions: true,
    collection: true,
    transfer: true,
    withdrawal: true,
  });
  

  if (!connection) {
    return (
      <AppLayout title="权限管理" showBack onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center h-64">
          <Info className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">服务商不存在</p>
        </div>
      </AppLayout>
    );
  }

  const { psp } = connection;

  const handleTogglePermission = (key: string) => {
    const config = permissionConfig.find(p => p.key === key);
    if (config?.required) {
      toast.error('此权限为必需权限，无法关闭');
      return;
    }
    const newValue = !permissions[key as keyof typeof permissions];
    setPermissions(prev => ({
      ...prev,
      [key]: newValue,
    }));
    toast.success(newValue ? '权限已开启' : '权限已关闭');
  };

  return (
    <AppLayout 
      title="权限管理" 
      showBack 
      onBack={() => navigate(-1)}
    >
      <div className="px-4 py-4 pb-24 flex flex-col">
        {/* PSP Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <PSPLogo pspId={psp.id} pspName={psp.name} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{psp.name}</h2>
                {psp.isVerified && (
                  <Shield className="w-4 h-4 text-accent" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">管理授权给此服务商的权限</p>
            </div>
          </div>
        </motion.div>

        {/* Permissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">已授权权限</h3>
          <div className="space-y-2">
            {permissionConfig.map((config, index) => {
              const Icon = config.icon;
              const isEnabled = permissions[config.key as keyof typeof permissions];
              
              return (
                <motion.div
                  key={config.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-xl border transition-colors',
                    isEnabled 
                      ? 'bg-card border-border' 
                      : 'bg-muted/30 border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isEnabled ? 'bg-accent/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        isEnabled ? 'text-accent' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-medium',
                          isEnabled ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {config.label}
                        </p>
                        {config.required && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                            必需
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{config.desc}</p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleTogglePermission(config.key)}
                      disabled={config.required}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 rounded-xl bg-muted/50 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            权限修改会立即生效。某些权限为必需权限，无法关闭。
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
