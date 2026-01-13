import { motion } from 'framer-motion';
import { ChainId, ChainInfo, SUPPORTED_CHAINS } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface ChainSelectorProps {
  selectedChain: ChainId;
  onSelectChain: (chain: ChainId) => void;
  showAll?: boolean;
  className?: string;
}

export function ChainSelector({ 
  selectedChain, 
  onSelectChain, 
  showAll = true,
  className 
}: ChainSelectorProps) {
  const chains = showAll 
    ? SUPPORTED_CHAINS 
    : SUPPORTED_CHAINS.filter(c => c.id !== 'all');

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide py-1", className)}>
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onSelectChain(chain.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0",
            selectedChain === chain.id
              ? "text-accent-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {selectedChain === chain.id && (
            <motion.div
              layoutId="chainSelector"
              className="absolute inset-0 gradient-accent rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{chain.icon}</span>
          <span className="relative z-10">{chain.shortName}</span>
        </button>
      ))}
    </div>
  );
}
