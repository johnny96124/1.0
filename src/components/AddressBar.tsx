import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressBarProps {
  address: string;
  label?: string;
  onClear?: () => void;
  className?: string;
}

export function AddressBar({ address, label, onClear, className }: AddressBarProps) {
  const truncatedAddress = address.length > 16 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border border-border/50",
      className
    )}>
      <span className="text-sm text-muted-foreground shrink-0">To</span>
      <div className="flex-1 min-w-0">
        {label ? (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{label}</span>
            <span className="text-sm text-muted-foreground font-mono">{truncatedAddress}</span>
          </div>
        ) : (
          <span className="font-mono text-foreground">{truncatedAddress}</span>
        )}
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
