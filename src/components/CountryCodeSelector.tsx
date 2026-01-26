import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Common countries list with flags
export const countries: Country[] = [
  { code: 'CN', name: '中国', dialCode: '+86', flag: '🇨🇳' },
  { code: 'HK', name: '中国香港', dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: '中国台湾', dialCode: '+886', flag: '🇹🇼' },
  { code: 'MO', name: '中国澳门', dialCode: '+853', flag: '🇲🇴' },
  { code: 'US', name: '美国', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: '英国', dialCode: '+44', flag: '🇬🇧' },
  { code: 'JP', name: '日本', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: '韩国', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: '新加坡', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: '马来西亚', dialCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: '泰国', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: '越南', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PH', name: '菲律宾', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: '印度尼西亚', dialCode: '+62', flag: '🇮🇩' },
  { code: 'IN', name: '印度', dialCode: '+91', flag: '🇮🇳' },
  { code: 'AU', name: '澳大利亚', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: '新西兰', dialCode: '+64', flag: '🇳🇿' },
  { code: 'CA', name: '加拿大', dialCode: '+1', flag: '🇨🇦' },
  { code: 'DE', name: '德国', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: '法国', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: '意大利', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: '西班牙', dialCode: '+34', flag: '🇪🇸' },
  { code: 'PT', name: '葡萄牙', dialCode: '+351', flag: '🇵🇹' },
  { code: 'NL', name: '荷兰', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: '比利时', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: '瑞士', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: '奥地利', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: '瑞典', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: '挪威', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: '丹麦', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: '芬兰', dialCode: '+358', flag: '🇫🇮' },
  { code: 'RU', name: '俄罗斯', dialCode: '+7', flag: '🇷🇺' },
  { code: 'AE', name: '阿联酋', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: '沙特阿拉伯', dialCode: '+966', flag: '🇸🇦' },
  { code: 'TR', name: '土耳其', dialCode: '+90', flag: '🇹🇷' },
  { code: 'BR', name: '巴西', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: '墨西哥', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: '阿根廷', dialCode: '+54', flag: '🇦🇷' },
  { code: 'ZA', name: '南非', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: '埃及', dialCode: '+20', flag: '🇪🇬' },
];

// Hot/popular countries shown at top
const hotCountries = ['CN', 'HK', 'US', 'JP', 'SG', 'GB'];

interface CountryCodeSelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  className?: string;
}

export function CountryCodeSelector({ 
  selectedCountry, 
  onSelect,
  className 
}: CountryCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      c => c.name.toLowerCase().includes(query) || 
           c.dialCode.includes(query) ||
           c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const hotCountryList = useMemo(() => 
    countries.filter(c => hotCountries.includes(c.code)),
    []
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-3 h-14 bg-muted/50 rounded-l-md border-r border-border hover:bg-muted transition-colors",
          className
        )}
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="text-sm font-medium text-foreground">{selectedCountry.dialCode}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border pb-3">
            <DrawerTitle>选择国家/地区</DrawerTitle>
          </DrawerHeader>
          
          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索国家/地区或区号"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            {/* Hot countries */}
            {!searchQuery && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 px-1">常用</p>
                <div className="space-y-1">
                  {hotCountryList.map((country) => (
                    <CountryItem
                      key={country.code}
                      country={country}
                      isSelected={selectedCountry.code === country.code}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All countries */}
            <div className="pb-6">
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mb-2 px-1">全部国家/地区</p>
              )}
              <div className="space-y-1">
                {filteredCountries.map((country) => (
                  <CountryItem
                    key={country.code}
                    country={country}
                    isSelected={selectedCountry.code === country.code}
                    onSelect={handleSelect}
                  />
                ))}
                {filteredCountries.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    未找到匹配的国家/地区
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}

interface CountryItemProps {
  country: Country;
  isSelected: boolean;
  onSelect: (country: Country) => void;
}

function CountryItem({ country, isSelected, onSelect }: CountryItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(country)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
        isSelected ? "bg-accent/10" : "hover:bg-muted/50"
      )}
    >
      <span className="text-2xl">{country.flag}</span>
      <span className="flex-1 text-left font-medium text-foreground">
        {country.name}
      </span>
      <span className="text-sm text-muted-foreground">{country.dialCode}</span>
      {isSelected && (
        <Check className="w-5 h-5 text-accent" />
      )}
    </motion.button>
  );
}

export default CountryCodeSelector;
