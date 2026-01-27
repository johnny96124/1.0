import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Fingerprint, Smartphone, 
  DollarSign, Calendar, CalendarDays, TestTube, 
  CheckCircle2, AlertTriangle, ChevronRight, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

const QUICK_LIMITS = [5000, 10000, 50000, 100000];

export default function SecurityPage() {
  const navigate = useNavigate();
  const { securityConfig, updateSecurityConfig, hasPin, hasBiometric, devices, contacts } = useWallet();
  
  const [showLimitDrawer, setShowLimitDrawer] = useState(false);
  const [editingLimit, setEditingLimit] = useState<'single' | 'daily' | 'monthly' | null>(null);
  const [tempLimit, setTempLimit] = useState('');
  const [showRiskDrawer, setShowRiskDrawer] = useState(false);
  
  // Calculate security score
  const securityFeatures = [
    { enabled: hasPin, label: '支付密码' },
    { enabled: hasBiometric, label: '生物识别' },
    { enabled: devices.length > 0, label: '设备验证' },
    { enabled: securityConfig.requireSatoshiTest, label: '首次转账测试' },
    { enabled: securityConfig.highRiskAction === 'block', label: '高风险拦截' },
  ];
  
  const enabledCount = securityFeatures.filter(f => f.enabled).length;
  const securityScore = Math.round((enabledCount / securityFeatures.length) * 100);
  
  const whitelistCount = contacts.filter(c => c.isWhitelisted).length;
  
  const handleEditLimit = (type: 'single' | 'daily' | 'monthly') => {
    setEditingLimit(type);
    const currentValue = type === 'single' 
      ? securityConfig.singleTransactionLimit 
      : type === 'daily' 
        ? securityConfig.dailyLimit 
        : securityConfig.monthlyLimit;
    setTempLimit(currentValue.toString());
    setShowLimitDrawer(true);
  };
  
  const handleSaveLimit = () => {
    const value = parseFloat(tempLimit);
    if (isNaN(value) || value <= 0) return;
    
    if (editingLimit === 'single') {
      updateSecurityConfig({ singleTransactionLimit: value });
    } else if (editingLimit === 'daily') {
      updateSecurityConfig({ dailyLimit: value });
    } else if (editingLimit === 'monthly') {
      updateSecurityConfig({ monthlyLimit: value });
    }
    setShowLimitDrawer(false);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const getLimitLabel = () => {
    switch (editingLimit) {
      case 'single': return '单笔限额';
      case 'daily': return '每日限额';
      case 'monthly': return '每月限额';
      default: return '';
    }
  };

  return (
    <AppLayout title="安全与风控" showBack>
      <div className="px-4 py-4 space-y-4">
        {/* Security Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              securityScore >= 80 ? 'bg-success/20' : securityScore >= 50 ? 'bg-warning/20' : 'bg-destructive/20'
            )}>
              <Shield className={cn(
                'w-5 h-5',
                securityScore >= 80 ? 'text-success' : securityScore >= 50 ? 'text-warning' : 'text-destructive'
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">安全等级</span>
                <span className={cn(
                  'text-lg font-bold',
                  securityScore >= 80 ? 'text-success' : securityScore >= 50 ? 'text-warning' : 'text-destructive'
                )}>
                  {securityScore >= 80 ? '高' : securityScore >= 50 ? '中' : '低'}
                </span>
              </div>
              <Progress value={securityScore} className="h-2 mt-1" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            已启用 {enabledCount}/{securityFeatures.length} 项安全功能
          </p>
        </motion.div>

        {/* Authentication & Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">认证与验证</h3>
          <div className="card-elevated overflow-hidden">
            <button className="w-full p-3 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">支付密码</p>
              </div>
              <span className="text-xs text-success">{hasPin ? '已设置' : '未设置'}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="p-3 flex items-center gap-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">生物识别</p>
              </div>
              <Switch checked={hasBiometric} />
            </div>
            
            <button 
              onClick={() => navigate('/profile/devices')}
              className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">设备验证</p>
              </div>
              <span className="text-xs text-muted-foreground">{devices.length} 台设备</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Transfer Risk Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">转账风控</h3>
          <div className="card-elevated overflow-hidden">
            <button 
              onClick={() => handleEditLimit('single')}
              className="w-full p-3 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">单笔限额</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(securityConfig.singleTransactionLimit)}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => handleEditLimit('daily')}
              className="w-full p-3 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">每日限额</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(securityConfig.dailyLimit)}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => handleEditLimit('monthly')}
              className="w-full p-3 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">每月限额</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(securityConfig.monthlyLimit)}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <div className="p-3 flex items-center gap-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <TestTube className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">首次转账测试</p>
                <p className="text-xs text-muted-foreground">新地址首次转账需先小额测试</p>
              </div>
              <Switch 
                checked={securityConfig.requireSatoshiTest}
                onCheckedChange={(checked) => updateSecurityConfig({ requireSatoshiTest: checked })}
              />
            </div>
            
            <div className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">白名单免验证</p>
                <p className="text-xs text-muted-foreground">白名单地址转账跳过二次验证</p>
              </div>
              <Switch 
                checked={securityConfig.whitelistBypass}
                onCheckedChange={(checked) => updateSecurityConfig({ whitelistBypass: checked })}
              />
            </div>
          </div>
        </motion.div>

        {/* Risk Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">风险控制</h3>
          <div className="card-elevated overflow-hidden">
            <button 
              onClick={() => setShowRiskDrawer(true)}
              className="w-full p-3 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">高风险地址处理</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {securityConfig.highRiskAction === 'block' ? '拦截' : '警告'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => navigate('/profile/contacts')}
              className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">白名单地址</p>
              </div>
              <span className="text-xs text-muted-foreground">{whitelistCount} 个地址</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Limit Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">额度使用情况</h3>
          <div className="card-elevated p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">今日已用</span>
                <span className="text-foreground">
                  {formatCurrency(securityConfig.dailyUsed)} / {formatCurrency(securityConfig.dailyLimit)}
                </span>
              </div>
              <Progress 
                value={(securityConfig.dailyUsed / securityConfig.dailyLimit) * 100} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">本月已用</span>
                <span className="text-foreground">
                  {formatCurrency(securityConfig.monthlyUsed)} / {formatCurrency(securityConfig.monthlyLimit)}
                </span>
              </div>
              <Progress 
                value={(securityConfig.monthlyUsed / securityConfig.monthlyLimit) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Limit Drawer */}
      <Drawer open={showLimitDrawer} onOpenChange={setShowLimitDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>修改{getLimitLabel()}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">输入新限额 (USD)</Label>
              <Input
                type="number"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
                placeholder="输入金额"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">快捷选择</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {QUICK_LIMITS.map((limit) => (
                  <Button
                    key={limit}
                    variant={tempLimit === limit.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTempLimit(limit.toString())}
                    className="text-xs"
                  >
                    ${(limit / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              提高限额需要进行身份验证
            </p>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowLimitDrawer(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveLimit}>
                确认修改
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Risk Action Drawer */}
      <Drawer open={showRiskDrawer} onOpenChange={setShowRiskDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>高风险地址处理方式</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-4">
            <RadioGroup
              value={securityConfig.highRiskAction}
              onValueChange={(value) => {
                updateSecurityConfig({ highRiskAction: value as 'block' | 'warn' });
                setShowRiskDrawer(false);
              }}
            >
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <RadioGroupItem value="block" id="block" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="block" className="font-medium cursor-pointer">拦截交易</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    检测到高风险地址时，直接阻止交易执行
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <RadioGroupItem value="warn" id="warn" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="warn" className="font-medium cursor-pointer">仅警告</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    显示风险提示，但允许用户确认后继续交易
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </DrawerContent>
      </Drawer>
    </AppLayout>
  );
}
