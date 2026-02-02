import { motion } from 'framer-motion';
import { Globe, Users, Star, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const linkItems = [
  {
    icon: Globe,
    label: '官方网站',
    action: () => {
      window.open('https://www.cobo.com', '_blank');
    },
  },
  {
    icon: Users,
    label: '关注我们',
    action: () => {
      toast.info('即将跳转到社交媒体...');
    },
  },
  {
    icon: Star,
    label: '给我们评分',
    action: () => {
      toast.info('感谢您的支持！');
    },
  },
];

export default function AboutPage() {
  return (
    <AppLayout showNav={false} title="关于我们" showBack>
      <div className="px-4 py-4 space-y-6">
        {/* Logo and Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <img 
              src="/src/assets/cobo-logo.svg" 
              alt="Cobo Logo" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-xl font-bold text-foreground">Cobo Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            版本 1.0.0 (Build 100)
          </p>
        </motion.div>

        {/* Company Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
            公司简介
          </h3>
          <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cobo 是全球领先的数字资产托管和安全解决方案提供商。我们致力于为用户提供安全、便捷、专业的数字资产管理服务。
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              凭借先进的安全技术和丰富的行业经验，我们已为全球数百万用户提供服务，管理资产规模超过数十亿美元。
            </p>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
            更多信息
          </h3>
          <div className="card-elevated overflow-hidden">
            {linkItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    'w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors',
                    index !== linkItems.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="pt-4 pb-8"
        >
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Cobo. All rights reserved.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
