import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { SecurityBanner } from '@/components/ui/SecurityBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showSecurityBanner?: boolean;
  // Header props
  title?: string;
  titleBadge?: number; // Red notification count badge beside title
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function AppLayout({ 
  children, 
  showNav = true, 
  showSecurityBanner = true,
  title,
  titleBadge,
  showBack = false,
  onBack,
  rightAction,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const showBanner = showNav && showSecurityBanner;
  const hasHeader = title || showBack || rightAction;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="h-full bg-background flex flex-col relative overflow-hidden">
      {showBanner && <SecurityBanner />}
      
      {/* Page Header - Grey nav design */}
      {hasHeader && (
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 bg-muted/30 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10"
        >
          <div className="w-10">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 -ml-2 rounded-lg hover:bg-muted"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {title && (
              <h1 className="text-lg font-semibold text-foreground">
                {title}
              </h1>
            )}
            {titleBadge !== undefined && titleBadge > 0 && (
              <Badge 
                variant="destructive" 
                className="h-5 min-w-5 px-1.5 text-xs font-medium"
              >
                {titleBadge > 99 ? '99+' : titleBadge}
              </Badge>
            )}
          </div>
          
          <div className="w-10 flex justify-end">
            {rightAction}
          </div>
        </motion.header>
      )}
      
      <main className={`flex-1 flex flex-col overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
