import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronRight, Shield, 
  CheckCircle2, Clock, AlertCircle, Building2,
  Sparkles, FileCheck, UserCheck, Send, XCircle, RefreshCw,
  Search, Filter, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { PSPConnection, PSPConnectionStatus, PSPServiceType } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { PSPLogo } from '@/components/PSPLogo';

// Tab configuration
const tabs = [
  { id: 'active', label: '已连接', icon: CheckCircle2 },
  { id: 'pending', label: '审核中', icon: Clock },
  { id: 'rejected', label: '已拒绝', icon: XCircle },
  { id: 'other', label: '其他', icon: AlertCircle },
] as const;

type TabId = typeof tabs[number]['id'];

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
    rejected: { 
      label: '已拒绝', 
      icon: XCircle, 
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

// Rejected PSP Card with reason and reapply option
function RejectedPSPCard({ connection, onClick, onReapply }: { 
  connection: PSPConnection; 
  onClick: () => void;
  onReapply: () => void;
}) {
  const { psp, rejectionInfo } = connection;
  const canReapply = rejectionInfo?.canReapply && 
    (!rejectionInfo.reapplyAfter || new Date() >= new Date(rejectionInfo.reapplyAfter));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 text-left"
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

        {/* Status */}
        <StatusBadge status={connection.status} />
      </button>

      {/* Rejection reason */}
      {rejectionInfo && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-start gap-2 mb-3">
            <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-destructive mb-1">拒绝原因</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{rejectionInfo.reason}</p>
            </div>
          </div>
          
          {canReapply && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onReapply();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新申请
            </Button>
          )}
          
          {!canReapply && rejectionInfo.reapplyAfter && (
            <p className="text-xs text-muted-foreground text-center">
              可在 {new Date(rejectionInfo.reapplyAfter).toLocaleDateString('zh-CN')} 后重新申请
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Service type options for filtering
const serviceTypeOptions = [
  { id: 'collection', label: '收款' },
  { id: 'transfer', label: '转账' },
  { id: 'withdrawal', label: '出金' },
  { id: 'deposit', label: '入金' },
] as const;

export default function PSPCenterPage() {
  const navigate = useNavigate();
  const { pspConnections } = useWallet();
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Toggle service filter
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedServices([]);
    setVerifiedOnly(false);
  };

  const hasActiveFilters = searchQuery || selectedServices.length > 0 || verifiedOnly;
  
  // Filter connections based on search and filters
  const filterConnections = (connections: PSPConnection[]) => {
    return connections.filter(conn => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = conn.psp.name.toLowerCase().includes(query);
        const matchesDesc = conn.psp.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      
      // Verified filter
      if (verifiedOnly && !conn.psp.isVerified) return false;
      
      // Service type filter
      if (selectedServices.length > 0) {
        const pspServices = conn.psp.availableServices || [];
        const hasMatchingService = selectedServices.some(s => pspServices.includes(s as PSPServiceType));
        if (!hasMatchingService) return false;
      }
      
      return true;
    });
  };

  const allActiveConnections = pspConnections?.filter(c => c.status === 'active') || [];
  const allPendingConnections = pspConnections?.filter(c => c.status === 'pending') || [];
  const allRejectedConnections = pspConnections?.filter(c => c.status === 'rejected') || [];
  const allOtherConnections = pspConnections?.filter(c => 
    c.status !== 'active' && c.status !== 'pending' && c.status !== 'rejected'
  ) || [];

  // Filtered connections
  const activeConnections = useMemo(() => filterConnections(allActiveConnections), [allActiveConnections, searchQuery, selectedServices, verifiedOnly]);
  const pendingConnections = useMemo(() => filterConnections(allPendingConnections), [allPendingConnections, searchQuery, selectedServices, verifiedOnly]);
  const rejectedConnections = useMemo(() => filterConnections(allRejectedConnections), [allRejectedConnections, searchQuery, selectedServices, verifiedOnly]);
  const otherConnections = useMemo(() => filterConnections(allOtherConnections), [allOtherConnections, searchQuery, selectedServices, verifiedOnly]);

  const getConnectionsByTab = (tab: TabId): PSPConnection[] => {
    switch (tab) {
      case 'active': return activeConnections;
      case 'pending': return pendingConnections;
      case 'rejected': return rejectedConnections;
      case 'other': return otherConnections;
    }
  };

  // Use unfiltered counts for tab badges
  const getTabCount = (tab: TabId): number => {
    switch (tab) {
      case 'active': return allActiveConnections.length;
      case 'pending': return allPendingConnections.length;
      case 'rejected': return allRejectedConnections.length;
      case 'other': return allOtherConnections.length;
    }
  };

  // Filter out tabs with no connections (except current tab)
  const visibleTabs = tabs.filter(tab => 
    tab.id === activeTab || getTabCount(tab.id) > 0
  );

  const handleConnect = () => {
    navigate('/psp/connect');
  };

  const handleViewDetail = (connection: PSPConnection) => {
    navigate(`/psp/${connection.id}`);
  };

  const handleReapply = (connection: PSPConnection) => {
    navigate('/psp/connect', { state: { reapplyPspId: connection.pspId } });
  };

  const currentConnections = getConnectionsByTab(activeTab);

  return (
    <AppLayout 
      title="服务商管理" 
      showBack 
      onBack={() => navigate(-1)}
    >
      <div className="flex flex-col h-full">
        {/* Stats Card - only show if has active connections */}
        {activeConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 card-elevated p-4 relative overflow-hidden"
          >
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
            className="mx-4 mt-4 card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
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

        {/* Search and Filter Section */}
        {pspConnections && pspConnections.length > 0 && (
          <div className="px-4 mt-4">
            {/* Search Bar */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索服务商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "shrink-0",
                  hasActiveFilters && !showFilters && "border-accent text-accent"
                )}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="p-3 rounded-xl bg-muted/30 space-y-3">
                    {/* Service Type Filters */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">服务类型</p>
                      <div className="flex flex-wrap gap-2">
                        {serviceTypeOptions.map(service => (
                          <button
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                              selectedServices.includes(service.id)
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                            )}
                          >
                            {service.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Verified Filter */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">仅显示已认证</span>
                      <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={cn(
                          'w-10 h-6 rounded-full transition-colors relative',
                          verifiedOnly ? 'bg-accent' : 'bg-muted'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                          verifiedOnly ? 'translate-x-5' : 'translate-x-1'
                        )} />
                      </button>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        清除筛选条件
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters Pills */}
            {hasActiveFilters && !showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {selectedServices.map(serviceId => {
                  const service = serviceTypeOptions.find(s => s.id === serviceId);
                  return (
                    <span
                      key={serviceId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs"
                    >
                      {service?.label}
                      <button onClick={() => toggleService(serviceId)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs">
                    <Shield className="w-3 h-3" />
                    已认证
                    <button onClick={() => setVerifiedOnly(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  清除全部
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        {pspConnections && pspConnections.length > 0 && (
          <div className="px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {count > 0 && (
                      <span className={cn(
                        'px-1.5 py-0.5 rounded-full text-xs',
                        isActive ? 'bg-accent-foreground/20' : 'bg-background'
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {pspConnections && pspConnections.length > 0 && (
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {currentConnections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      {activeTab === 'active' && <CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                      {activeTab === 'pending' && <Clock className="w-8 h-8 text-muted-foreground" />}
                      {activeTab === 'rejected' && <XCircle className="w-8 h-8 text-muted-foreground" />}
                      {activeTab === 'other' && <AlertCircle className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hasActiveFilters ? (
                        '没有找到匹配的服务商'
                      ) : (
                        <>
                          {activeTab === 'active' && '暂无已连接的服务商'}
                          {activeTab === 'pending' && '暂无待审核的申请'}
                          {activeTab === 'rejected' && '暂无被拒绝的申请'}
                          {activeTab === 'other' && '暂无其他状态的服务商'}
                        </>
                      )}
                    </p>
                    {hasActiveFilters ? (
                      <Button onClick={clearFilters} variant="outline" size="sm" className="mt-3">
                        <X className="w-4 h-4 mr-1" />
                        清除筛选
                      </Button>
                    ) : activeTab === 'active' && (
                      <Button onClick={handleConnect} variant="outline" size="sm" className="mt-3">
                        <Plus className="w-4 h-4 mr-1" />
                        添加服务商
                      </Button>
                    )}
                  </div>
                ) : (
                  currentConnections.map((connection) => {
                    if (activeTab === 'pending') {
                      return (
                        <PendingPSPCard 
                          key={connection.id} 
                          connection={connection}
                          onClick={() => handleViewDetail(connection)}
                        />
                      );
                    }
                    if (activeTab === 'rejected') {
                      return (
                        <RejectedPSPCard 
                          key={connection.id} 
                          connection={connection}
                          onClick={() => handleViewDetail(connection)}
                          onReapply={() => handleReapply(connection)}
                        />
                      );
                    }
                    return (
                      <PSPCard 
                        key={connection.id} 
                        connection={connection}
                        onClick={() => handleViewDetail(connection)}
                      />
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
