import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';

const networks = [
  { id: 'eth', name: 'Ethereum (ERC-20)', icon: '⟠' },
  { id: 'tron', name: 'Tron (TRC-20)', icon: '🔺' },
  { id: 'bsc', name: 'BNB Chain', icon: '🟡' },
];

export default function ReceivePage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentWallet } = useWallet();
  const { toast } = useToast();

  // Generate a mock address (in real app, this would be network-specific)
  const address = currentWallet?.address || '0x1234...5678';
  const fullAddress = '0x1234567890abcdef1234567890abcdef12345678';

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
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-6">收款</h1>

          {/* Network Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              选择网络
            </label>
            <button
              onClick={() => setShowNetworkSelect(!showNetworkSelect)}
              className="w-full card-elevated p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedNetwork.icon}</span>
                <span className="font-medium text-foreground">{selectedNetwork.name}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showNetworkSelect ? 'rotate-180' : ''}`} />
            </button>

            {showNetworkSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 card-elevated overflow-hidden"
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
                    <span className="text-2xl">{network.icon}</span>
                    <span className="font-medium text-foreground">{network.name}</span>
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
            className="card-elevated p-6 text-center mb-6"
          >
            <div className="w-48 h-48 mx-auto bg-foreground rounded-xl p-3 mb-4">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                {/* Simulated QR Code */}
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm ${
                        Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              使用 {selectedNetwork.name} 网络转账到以下地址
            </p>
            
            <div className="bg-muted/50 rounded-xl p-3 font-mono text-sm break-all text-foreground">
              {fullAddress}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              className="flex-1 h-12"
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
              className="flex-1 h-12"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>

          {/* Warning */}
          <div className="card-elevated p-4 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">重要提示</p>
                <p className="text-sm text-muted-foreground mt-1">
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
