import { motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { useLanguage, languageOptions, Language } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface LanguageSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageSelectDrawer({ open, onOpenChange }: LanguageSelectDrawerProps) {
  const { language, setLanguage, isSystemDefault, setIsSystemDefault, getLabel } = useLanguage();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    toast.success(lang === 'zh-CN' ? '语言已切换' : 'Language changed');
    onOpenChange(false);
  };

  const handleSystemDefaultToggle = (checked: boolean) => {
    setIsSystemDefault(checked);
    if (checked) {
      toast.success(language === 'zh-CN' ? '已跟随系统设置' : 'Following system settings');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle>{language === 'zh-CN' ? '选择语言' : 'Select Language'}</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6">
          {/* System Default Toggle */}
          <div className="flex items-center justify-between p-4 mb-2 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {language === 'zh-CN' ? '跟随系统' : 'Follow System'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'zh-CN' ? '自动检测设备语言' : 'Auto-detect device language'}
                </p>
              </div>
            </div>
            <Switch
              checked={isSystemDefault}
              onCheckedChange={handleSystemDefaultToggle}
            />
          </div>

          {/* Language Options */}
          <div className="space-y-1">
            {languageOptions.map((option) => (
              <motion.button
                key={option.code}
                onClick={() => handleSelectLanguage(option.code)}
                disabled={isSystemDefault}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full p-4 flex items-center justify-between rounded-xl transition-colors',
                  isSystemDefault 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'active:bg-muted/50',
                  language === option.code && !isSystemDefault && 'bg-accent/10'
                )}
              >
                <span className="font-medium text-foreground">
                  {option.nativeName}
                </span>
                {language === option.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {isSystemDefault && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              {language === 'zh-CN' 
                ? '关闭「跟随系统」可手动选择语言' 
                : 'Turn off "Follow System" to select manually'}
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
