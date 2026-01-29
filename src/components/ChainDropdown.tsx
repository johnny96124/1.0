import { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
import { ChainIcon } from '@/components/ChainIcon';
import { toast } from '@/lib/toast';

interface ChainDropdownProps {
  selectedChain: ChainId;
  onSelectChain: (chain: ChainId) => void;
  addresses?: Record<ChainId, string>;
  className?: string;
}

export function ChainDropdown({ 
  selectedChain, 
  onSelectChain, 
  addresses,
  className 
}: ChainDropdownProps) {
  const [copiedChain, setCopiedChain] = useState<ChainId | null>(null);
  
  const selectedChainInfo = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
  
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = (e: React.MouseEvent, chainId: ChainId, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedChain(chainId);
    const chainName = SUPPORTED_CHAINS.find(c => c.id === chainId)?.shortName || chainId;
    toast.success(`${chainName} 地址已复制`);
    setTimeout(() => setCopiedChain(null), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 px-2 gap-1.5 bg-secondary/80 hover:bg-muted/50 hover:text-foreground rounded-full",
            className
          )}
        >
          <ChainIcon chainId={selectedChainInfo?.icon || 'all'} size="md" />
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-popover border border-border shadow-xl z-50 max-h-[60vh] overflow-y-auto"
        container={document.getElementById('phone-frame-container') || undefined}
      >
        {SUPPORTED_CHAINS.map((chain) => {
          const address = addresses?.[chain.id] || '';
          const isSelected = selectedChain === chain.id;
          const showAddress = chain.id !== 'all' && address;
          
          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => onSelectChain(chain.id)}
              className={cn(
                "flex items-center justify-between gap-3 py-3 px-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50",
                isSelected && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ChainIcon chainId={chain.icon} size="lg" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {chain.name}
                  </p>
                  {showAddress && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {formatAddress(address)}
                    </p>
                  )}
                </div>
              </div>
              {showAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 hover:bg-muted/50"
                  onClick={(e) => handleCopyAddress(e, chain.id, address)}
                >
                  {copiedChain === chain.id ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </Button>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
