import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Monitor, Tablet, MapPin, Clock, 
  MoreVertical, Trash2, Shield, AlertTriangle, Check, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Device } from '@/types/wallet';

// Mock login history data
const mockLoginHistory = [
  { id: '1', deviceName: 'iPhone 15 Pro', timestamp: new Date(), location: '上海, 中国' },
  { id: '2', deviceName: 'MacBook Pro', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), location: '北京, 中国' },
  { id: '3', deviceName: 'iPhone 15 Pro', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), location: '上海, 中国' },
];

export default function DeviceManagementPage() {
  const { devices, removeDevice, addDevice } = useWallet();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  
  const currentDevice = devices.find(d => d.isCurrent);
  const otherDevices = devices.filter(d => !d.isCurrent && d.status === 'active');
  const pendingDevices = devices.filter(d => d.status === 'pending');
  
  const getDeviceIcon = (model: string) => {
    if (model.toLowerCase().includes('iphone') || model.toLowerCase().includes('android')) {
      return Smartphone;
    }
    if (model.toLowerCase().includes('ipad') || model.toLowerCase().includes('tablet')) {
      return Tablet;
    }
    return Monitor;
  };
  
  const handleRemoveDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowRemoveDialog(true);
  };
  
  const confirmRemove = () => {
    if (selectedDevice) {
      removeDevice(selectedDevice.id);
    }
    setShowRemoveDialog(false);
    setSelectedDevice(null);
  };
  
  const handleAuthorize = (deviceId: string) => {
    // In real app, this would update device status
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      addDevice({ ...device, status: 'active' });
    }
  };
  
  const handleReject = (deviceId: string) => {
    removeDevice(deviceId);
  };
  
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚活跃';
    if (diffMins < 60) return `${diffMins}分钟前活跃`;
    
    return formatDistanceToNow(date, { locale: zhCN, addSuffix: true }) + '活跃';
  };

  return (
    <AppLayout title="设备管理" showBack>
      <div className="px-4 py-4 space-y-4">
        {/* Current Device */}
        {currentDevice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">当前设备</h3>
            <div className="card-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  {(() => {
                    const Icon = getDeviceIcon(currentDevice.model);
                    return <Icon className="w-5 h-5 text-accent" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{currentDevice.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded">
                      当前设备
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{currentDevice.location || '未知位置'}</span>
                    <span>·</span>
                    <span>刚刚活跃</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pending Devices */}
        <AnimatePresence>
          {pendingDevices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.05 }}
            >
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">待授权设备</h3>
              <div className="card-elevated overflow-hidden">
                {pendingDevices.map((device, index) => {
                  const Icon = getDeviceIcon(device.model);
                  return (
                    <div 
                      key={device.id}
                      className={cn(
                        'p-4',
                        index !== pendingDevices.length - 1 && 'border-b border-border'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{device.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded">
                              待验证
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{device.location || '未知位置'}</span>
                            <span>·</span>
                            <span>等待授权</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleReject(device.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              拒绝
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleAuthorize(device.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              授权
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other Devices */}
        {otherDevices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">其他设备</h3>
            <div className="card-elevated overflow-hidden">
              {otherDevices.map((device, index) => {
                const Icon = getDeviceIcon(device.model);
                return (
                  <div 
                    key={device.id}
                    className={cn(
                      'p-4 flex items-start gap-3',
                      index !== otherDevices.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{device.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{device.location || '未知位置'}</span>
                        <span>·</span>
                        <span>{formatLastActive(device.lastActive)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleRemoveDevice(device)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          移除设备
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Security Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-elevated p-4 border-l-4 border-l-yellow-500"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">安全提醒</h4>
              <p className="text-xs text-muted-foreground mt-1">
                如发现可疑设备，请立即移除并修改密码
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10"
                onClick={() => setShowFreezeDialog(true)}
              >
                <Shield className="w-3 h-3 mr-1" />
                紧急模式：冻结所有设备
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Login History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-medium text-muted-foreground">登录历史</h3>
            <button className="text-xs text-accent">查看全部</button>
          </div>
          <div className="card-elevated overflow-hidden">
            {mockLoginHistory.map((record, index) => (
              <div 
                key={record.id}
                className={cn(
                  'p-3 flex items-center gap-3',
                  index !== mockLoginHistory.length - 1 && 'border-b border-border'
                )}
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{record.deviceName}</p>
                  <p className="text-xs text-muted-foreground">{record.location}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(record.timestamp, 'HH:mm', { locale: zhCN })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Remove Device Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除设备</AlertDialogTitle>
            <AlertDialogDescription>
              移除后，该设备将无法访问您的钱包。设备需要重新验证才能恢复使用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedDevice && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedDevice.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                最后活跃: {formatLastActive(selectedDevice.lastActive)}
              </div>
              <div className="text-xs text-muted-foreground">
                位置: {selectedDevice.location || '未知'}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Freeze All Dialog */}
      <AlertDialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">紧急冻结</AlertDialogTitle>
            <AlertDialogDescription>
              启用紧急模式将冻结所有设备的访问权限，包括当前设备。解冻需要通过身份验证。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => setShowFreezeDialog(false)}
            >
              确认冻结
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
