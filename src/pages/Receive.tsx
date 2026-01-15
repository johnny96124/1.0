import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
import { ChainIcon } from '@/components/ChainIcon';

const networks = SUPPORTED_CHAINS.filter(c => c.id !== 'all').map(c => ({
  id: c.id as Exclude<ChainId, 'all'>,
  name: c.name,
  icon: c.icon,
  shortName: c.shortName,
}));

export default function ReceivePage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentWallet } = useWallet();
  const { toast } = useToast();

  // Get the address for the selected network
  const fullAddress = useMemo(() => {
    if (!currentWallet?.addresses) return '0x1234567890abcdef1234567890abcdef12345678';
    return currentWallet.addresses[selectedNetwork.id] || '地址生成中...';
  }, [currentWallet, selectedNetwork.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      toast({
        title: '已复制到剪贴板',
        description: '收款地址已复制',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制地址',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: '收款地址',
        text: `我的${selectedNetwork.name}收款地址: ${fullAddress}`,
      });
    } catch (error) {
      // User cancelled or share not supported
      handleCopy();
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-4">收款</h1>

          {/* Network Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              选择网络
            </label>
            <button
              onClick={() => setShowNetworkSelect(!showNetworkSelect)}
              className="w-full card-elevated p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ChainIcon chainId={selectedNetwork.id} size="lg" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-foreground">{selectedNetwork.name}</span>
                  <span className="text-xs text-muted-foreground">{selectedNetwork.shortName}</span>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showNetworkSelect ? 'rotate-180' : ''}`} />
            </button>

            {showNetworkSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 card-elevated overflow-hidden z-50"
              >
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => {
                      setSelectedNetwork(network);
                      setShowNetworkSelect(false);
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                      selectedNetwork.id === network.id ? 'bg-accent/5' : ''
                    }`}
                  >
                    <ChainIcon chainId={network.id} size="lg" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-foreground">{network.name}</span>
                      <span className="text-xs text-muted-foreground">{network.shortName}</span>
                    </div>
                    {selectedNetwork.id === network.id && (
                      <CheckCircle2 className="w-5 h-5 text-accent ml-auto" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card-elevated p-4 text-center mb-4"
          >
            <div className="w-36 h-36 mx-auto bg-foreground rounded-xl p-2 mb-3">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                {/* Simulated QR Code */}
                <div className="grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-sm ${
                        Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              使用 {selectedNetwork.name} 网络转账到以下地址
            </p>
            
            <div className="bg-muted/50 rounded-xl p-2 font-mono text-xs break-all text-foreground">
              {fullAddress}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              复制地址
            </Button>
            <Button
              className="flex-1 h-10"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>

          {/* Warning */}
          <div className="card-elevated p-3 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">重要提示</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  请确保付款方选择相同的网络（{selectedNetwork.name}），否则可能导致资金丢失。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
