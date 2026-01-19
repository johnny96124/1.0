import { motion } from 'framer-motion';
import { 
  Plus, ChevronRight, Shield, 
  CheckCircle2, Clock, AlertCircle, Building2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { PSPConnection, PSPConnectionStatus } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { PSPLogo } from '@/components/PSPLogo';

// Status badge component
function StatusBadge({ status }: { status: PSPConnectionStatus }) {
  const config = {
    active: { 
      label: '已连接', 
      icon: CheckCircle2, 
      className: 'bg-success/10 text-success' 
    },
    pending: { 
      label: '待验证', 
      icon: Clock, 
      className: 'bg-warning/10 text-warning' 
    },
    suspended: { 
      label: '已暂停', 
      icon: AlertCircle, 
      className: 'bg-muted text-muted-foreground' 
    },
    expired: { 
      label: '已过期', 
      icon: AlertCircle, 
      className: 'bg-destructive/10 text-destructive' 
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

// PSP Card component
function PSPCard({ connection, onClick }: { connection: PSPConnection; onClick: () => void }) {
  const { psp, status, stats } = connection;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
    >
      {/* PSP Logo */}
      <PSPLogo pspId={psp.id} pspName={psp.name} />

      {/* PSP Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-foreground text-sm truncate">{psp.name}</h3>
          {psp.isVerified && (
            <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>交易 {stats.totalTransactions} 笔</span>
          <span>·</span>
          <span>${stats.totalVolume.toLocaleString()}</span>
        </div>
      </div>

      {/* Status & Arrow */}
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}

// Empty state component
function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
        <Building2 className="w-10 h-10 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        连接您的服务商
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        通过扫码或输入授权码，连接您的支付服务商，享受专属服务
      </p>
      <Button onClick={onConnect} className="gradient-accent gap-2">
        <Plus className="w-4 h-4" />
        添加服务商
      </Button>
    </motion.div>
  );
}

export default function PSPCenterPage() {
  const navigate = useNavigate();
  const { pspConnections } = useWallet();
  
  const activeConnections = pspConnections?.filter(c => c.status === 'active') || [];
  const otherConnections = pspConnections?.filter(c => c.status !== 'active') || [];

  const handleConnect = () => {
    navigate('/psp/connect');
  };

  const handleViewDetail = (connection: PSPConnection) => {
    navigate(`/psp/${connection.id}`);
  };

  return (
    <AppLayout 
      title="服务商管理" 
      showBack 
      onBack={() => navigate(-1)}
    >
      <div className="px-4 py-4">
        {/* Stats Card - only show if has connections */}
        {pspConnections && pspConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-4 mb-4 relative overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">我的服务商</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pspConnections.reduce((sum, c) => sum + c.stats.totalTransactions, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">总交易</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground truncate">
                    ${pspConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0) >= 1000000 
                      ? `${(pspConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0) / 1000000).toFixed(1)}M`
                      : pspConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">总交易额</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Connect Button */}
        {pspConnections && pspConnections.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handleConnect}
            className="w-full card-elevated p-4 flex items-center gap-3 mb-4 hover:bg-muted/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">添加新服务商</p>
              <p className="text-xs text-muted-foreground">从服务商列表中选择</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}

        {/* Empty State */}
        {(!pspConnections || pspConnections.length === 0) && (
          <EmptyState onConnect={handleConnect} />
        )}

        {/* Active Connections */}
        {activeConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              已连接 ({activeConnections.length})
            </h2>
            <div className="space-y-2">
              {activeConnections.map((connection, index) => (
                <PSPCard 
                  key={connection.id} 
                  connection={connection}
                  onClick={() => handleViewDetail(connection)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Other Connections */}
        {otherConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              其他 ({otherConnections.length})
            </h2>
            <div className="space-y-2">
              {otherConnections.map((connection) => (
                <PSPCard 
                  key={connection.id} 
                  connection={connection}
                  onClick={() => handleViewDetail(connection)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
