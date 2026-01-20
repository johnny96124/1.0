import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Building2, ChevronRight, Send, QrCode, 
  ArrowDownToLine, ArrowUpFromLine, FileText,
  Phone, Mail, Globe, Star, Clock, AlertCircle,
  Unlink, CheckCircle2, Pause, XCircle, RefreshCw, Trash2, Settings
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { PSPServiceType } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { PSPLogo } from '@/components/PSPLogo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Service icon mapping
const serviceConfig: Record<PSPServiceType, { icon: typeof Send; label: string; desc: string }> = {
  collection: { icon: QrCode, label: '收款', desc: '接收付款' },
  transfer: { icon: Send, label: '转账', desc: '发起付款' },
  withdrawal: { icon: ArrowDownToLine, label: '出金', desc: '提现到银行' },
  deposit: { icon: ArrowUpFromLine, label: '入金', desc: '充值到钱包' },
  settlement: { icon: FileText, label: '结算', desc: '资金结算' },
};

export default function PSPDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pspConnections, disconnectPSP, suspendPSP } = useWallet();
  
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Find the connection
  const connection = useMemo(() => {
    return pspConnections?.find(c => c.id === id);
  }, [pspConnections, id]);

  if (!connection) {
    return (
      <AppLayout title="服务商详情" showBack onBack={() => navigate(-1)}>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">服务商不存在</p>
        </div>
      </AppLayout>
    );
  }

  const { psp, status, connectedAt, stats, permissions, rejectionInfo } = connection;

  const handleReapply = () => {
    navigate('/psp/connect', { state: { reapplyPspId: connection.pspId } });
  };

  const handleServiceClick = (service: PSPServiceType) => {
    switch (service) {
      case 'collection':
        navigate('/receive');
        break;
      case 'transfer':
        navigate('/send');
        break;
      case 'withdrawal':
        toast.info('出金功能即将上线');
        break;
      case 'deposit':
        toast.info('入金功能即将上线');
        break;
      case 'settlement':
        toast.info('结算功能即将上线');
        break;
    }
  };

  const handleSuspend = async () => {
    await suspendPSP(connection.id);
    toast.success(status === 'suspended' ? '已恢复服务' : '已暂停服务');
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectPSP(connection.id);
      toast.success('已解除连接');
      navigate('/psp');
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

  return (
    <AppLayout 
      title="服务商详情" 
      showBack 
      onBack={() => navigate(-1)}
      rightAction={
        status === 'active' ? (
          <Button variant="ghost" size="icon" onClick={() => navigate(`/psp/${id}/permissions`)}>
            <Settings className="w-5 h-5" />
          </Button>
        ) : undefined
      }
    >
      <div className="px-4 py-4">
        {/* PSP Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 mb-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              {/* Logo */}
              <PSPLogo pspId={psp.id} pspName={psp.name} size="lg" />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{psp.name}</h1>
                  {psp.isVerified && (
                    <Shield className="w-4 h-4 text-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{psp.description}</p>
                
                {/* Status */}
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    status === 'active' ? 'bg-success/10 text-success' : 
                    status === 'suspended' ? 'bg-muted text-muted-foreground' :
                    status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
                     status === 'suspended' ? <Pause className="w-3 h-3" /> :
                     status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                     status === 'pending' ? <Clock className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    {status === 'active' ? '已连接' : 
                     status === 'suspended' ? '已暂停' : 
                     status === 'rejected' ? '已拒绝' :
                     status === 'pending' ? '审核中' : '已过期'}
                  </div>
                  {psp.rating && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {psp.rating}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Info - Show when rejected */}
            {status === 'rejected' && rejectionInfo && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">申请已被拒绝</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rejectionInfo.reason}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      拒绝时间: {new Date(rejectionInfo.rejectedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                {rejectionInfo.canReapply && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2 gap-2"
                    onClick={handleReapply}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    重新申请
                  </Button>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground">交易笔数</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">${stats.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">交易总额</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {Math.floor((Date.now() - connectedAt.getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-xs text-muted-foreground">已连接(天)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Available Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">可用服务</h2>
          <div className="grid grid-cols-4 gap-3">
            {psp.availableServices.map((service) => {
              const config = serviceConfig[service];
              const Icon = config.icon;
              const isEnabled = permissions[service as keyof typeof permissions] ?? true;

              return (
                <button
                  key={service}
                  onClick={() => isEnabled && handleServiceClick(service)}
                  disabled={!isEnabled || status !== 'active'}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                    isEnabled && status === 'active'
                      ? 'bg-card hover:bg-muted/50' 
                      : 'bg-muted/30 opacity-50'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    isEnabled && status === 'active' ? 'bg-accent/10' : 'bg-muted'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      isEnabled && status === 'active' ? 'text-accent' : 'text-muted-foreground'
                    )} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{config.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Fee Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-4 mb-4"
        >
          <h2 className="text-sm font-medium text-foreground mb-3">费率信息</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">收款费率</span>
              <span className="text-sm font-medium text-foreground">{psp.feeConfig.collection}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">转账费率</span>
              <span className="text-sm font-medium text-foreground">{psp.feeConfig.transfer}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">出金费率</span>
              <span className="text-sm font-medium text-foreground">{psp.feeConfig.withdrawal}%</span>
            </div>
            {psp.feeConfig.minWithdrawal && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">最低提现金额</span>
                <span className="text-sm font-medium text-foreground">${psp.feeConfig.minWithdrawal}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated overflow-hidden mb-4"
        >
          <h2 className="text-sm font-medium text-foreground p-4 pb-2">联系方式</h2>
          
          {psp.contact.phone && (
            <button className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">{psp.contact.phone}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}
          
          {psp.contact.email && (
            <button className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">{psp.contact.email}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}
          
          {psp.contact.supportUrl && (
            <button className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">在线客服</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}
        </motion.div>

        {/* Actions - Different buttons based on status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          {/* For rejected status - show delete button only */}
          {status === 'rejected' && (
            <Button 
              variant="outline" 
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setShowDisconnectDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除申请记录
            </Button>
          )}

          {/* For pending status - show cancel button */}
          {status === 'pending' && (
            <Button 
              variant="outline" 
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setShowDisconnectDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              取消申请
            </Button>
          )}

          {/* For active/suspended status - show suspend and disconnect */}
          {(status === 'active' || status === 'suspended') && (
            <>
              <Button 
                variant="outline" 
                className="w-full h-11"
                onClick={handleSuspend}
              >
                <Pause className="w-4 h-4 mr-2" />
                {status === 'suspended' ? '恢复服务' : '暂停服务'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={() => setShowDisconnectDialog(true)}
              >
                <Unlink className="w-4 h-4 mr-2" />
                解除连接
              </Button>
            </>
          )}
        </motion.div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === 'rejected' ? '确认删除记录？' : 
               status === 'pending' ? '确认取消申请？' : '确认解除连接？'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === 'rejected' 
                ? `删除与 ${psp.name} 的申请记录后，相关信息将被清除。如需再次连接，请重新申请。`
                : status === 'pending'
                ? `取消与 ${psp.name} 的连接申请后，审核流程将终止。如需再次连接，请重新申请。`
                : `解除与 ${psp.name} 的连接后，您将无法使用该服务商的服务。此操作不会影响已完成的交易记录。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisconnecting ? '处理中...' : '确认解除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
