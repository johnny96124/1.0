import { motion } from 'framer-motion';
import { 
  Plus, ChevronRight, Shield, 
  CheckCircle2, Clock, AlertCircle, Building2,
  Sparkles, FileCheck, UserCheck, Send
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
      label: '审核中', 
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

// Review progress component for pending connections
function ReviewProgress({ connection }: { connection: PSPConnection }) {
  const steps = [
    { id: 'submitted', label: '已提交', icon: Send, completed: true },
    { id: 'reviewing', label: '资料审核', icon: FileCheck, completed: false },
    { id: 'approved', label: '审核通过', icon: UserCheck, completed: false },
  ];

  // Simulate progress based on connection time (for demo)
  const submittedDate = new Date(connection.connectedAt);
  const now = new Date();
  const hoursPassed = (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60);
  
  // Step 1 always completed, step 2 in progress after 1 hour
  const currentStep = hoursPassed > 24 ? 2 : hoursPassed > 1 ? 1 : 0;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step indicator with connecting line */}
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div 
                    className={cn(
                      "flex-1 h-0.5 -mr-1",
                      isCompleted || isCurrent ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                    isCompleted ? "bg-accent text-accent-foreground" : 
                    isCurrent ? "bg-accent/20 text-accent ring-2 ring-accent/30" : 
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <StepIcon className="w-3 h-3" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-0.5 -ml-1",
                      isCompleted ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
              </div>
              {/* Step label */}
              <span 
                className={cn(
                  "text-[10px] mt-1.5 text-center",
                  isCompleted || isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        预计 1-3 个工作日完成审核
      </p>
    </div>
  );
}

// PSP Card component for active connections
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

// PSP Card for pending connections with review progress
function PendingPSPCard({ connection, onClick }: { connection: PSPConnection; onClick: () => void }) {
  const { psp, status } = connection;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
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
          <p className="text-xs text-muted-foreground">
            申请时间: {new Date(connection.connectedAt).toLocaleDateString('zh-CN')}
          </p>
        </div>

        {/* Status & Arrow */}
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {/* Review Progress */}
      <ReviewProgress connection={connection} />
    </motion.div>
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
  const pendingConnections = pspConnections?.filter(c => c.status === 'pending') || [];
  const otherConnections = pspConnections?.filter(c => c.status !== 'active' && c.status !== 'pending') || [];

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
        {/* Stats Card - only show if has active connections */}
        {activeConnections.length > 0 && (
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
                    {activeConnections.reduce((sum, c) => sum + c.stats.totalTransactions, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">总交易</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground truncate">
                    ${activeConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0) >= 1000000 
                      ? `${(activeConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0) / 1000000).toFixed(1)}M`
                      : activeConnections.reduce((sum, c) => sum + c.stats.totalVolume, 0).toLocaleString()}
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

        {/* Pending Connections - Show first with review progress */}
        {pendingConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h2 className="text-sm font-medium text-warning mb-2 px-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              待审核 ({pendingConnections.length})
            </h2>
            <div className="space-y-3">
              {pendingConnections.map((connection) => (
                <PendingPSPCard 
                  key={connection.id} 
                  connection={connection}
                  onClick={() => handleViewDetail(connection)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Connections */}
        {activeConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h2 className="text-sm font-medium text-success mb-2 px-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              已连接 ({activeConnections.length})
            </h2>
            <div className="space-y-2">
              {activeConnections.map((connection) => (
                <PSPCard 
                  key={connection.id} 
                  connection={connection}
                  onClick={() => handleViewDetail(connection)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Other Connections (suspended, expired) */}
        {otherConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
