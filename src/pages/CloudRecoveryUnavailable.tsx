import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CloudOff, ArrowLeft, Smartphone, Cloud, 
  CheckCircle2, ArrowRight, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CloudRecoveryUnavailable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloudProvider = searchParams.get('provider') || 'icloud';

  const handleBack = () => {
    navigate('/tss-recovery?cloud=false');
  };

  const handleContactSupport = () => {
    navigate('/help');
  };

  const providerName = cloudProvider === 'icloud' ? 'iCloud' : 'Google Drive';

  const backupSteps = [
    {
      id: 1,
      title: '打开旧设备上的 Cobo 钱包',
      description: '确保旧设备可以正常使用',
    },
    {
      id: 2,
      title: '进入设置 → 安全备份',
      description: '在个人中心找到安全备份选项',
    },
    {
      id: 3,
      title: '选择云端备份',
      description: `将备份数据同步到 ${providerName}`,
    },
    {
      id: 4,
      title: '设置备份密码',
      description: '请牢记此密码，恢复时需要使用',
    },
  ];

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium text-foreground">
            云端备份不可用
          </span>
          <div className="w-5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          {/* Header Info */}
          <div className="flex flex-col items-center text-center pt-6 pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4"
            >
              <CloudOff className="w-8 h-8 text-warning" />
            </motion.div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              未检测到云端备份
            </h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              您的 {providerName} 中暂无备份数据，请先在旧设备上完成云端备份
            </p>
          </div>

          {/* Backup Instructions */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                在旧设备上完成备份
              </span>
            </div>

            <div className="space-y-4">
              {backupSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">
                      {step.id}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* After Backup Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-success/5 border border-success/20 rounded-xl p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">
                  备份完成后
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  返回此页面，选择「云端恢复」即可继续
                </p>
              </div>
            </div>
          </motion.div>

          {/* Alternative Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-muted/30 rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground mb-3">
              如果您有本地备份文件，也可以使用本地文件恢复
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/tss-recovery?cloud=false')}
            >
              使用本地文件恢复
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 pt-4 space-y-3">
        <Button
          size="lg"
          className="w-full text-base font-medium"
          onClick={handleBack}
        >
          <Cloud className="w-5 h-5 mr-2" />
          已完成备份，重新检测
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-base"
          onClick={handleContactSupport}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          联系客服
        </Button>
      </div>
    </div>
  );
}
