import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface AddressDisplayProps {
  address: string;
  label?: string;
  className?: string;
  showFull?: boolean;
}

export function AddressDisplay({ 
  address, 
  label,
  className,
  showFull = false 
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    if (showFull || addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('已复制', '地址已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败', '请手动复制地址');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors group",
        className
      )}
    >
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
      <span className="font-mono text-xs text-foreground/80">
        {formatAddress(address)}
      </span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </button>
  );
}
