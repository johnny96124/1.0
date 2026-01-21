import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, CheckCircle2, ChevronDown, Info, Search, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/sonner';
import { ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
import { ChainIcon } from '@/components/ChainIcon';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const networks = SUPPORTED_CHAINS.filter(c => c.id !== 'all').map(c => ({
  id: c.id as Exclude<ChainId, 'all'>,
  name: c.name,
  icon: c.icon,
  shortName: c.shortName,
}));

// Mock addresses for each chain (real format)
const MOCK_ADDRESSES: Record<Exclude<ChainId, 'all'>, string> = {
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD91',
  tron: 'TN7qZLpmCvTnfbXnYFMBEZAjuZwKyxqvMb',
  bsc: '0x8B4c5A9d3E7f1C2b0A6D8E9F4C3B2A1E7D6C5B4A',
};

// Frequently used networks (can be customized based on user history)
const frequentNetworkIds = ['ethereum', 'tron'];

export default function ReceivePage() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { currentWallet } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle context-aware back navigation
  const handleBack = useCallback(() => {
    // Check if there's a referrer state passed from the previous page
    const fromPage = location.state?.from;
    
    if (fromPage) {
      navigate(fromPage);
    } else if (window.history.length > 2) {
      // If there's browser history, go back
      navigate(-1);
    } else {
      // Default fallback to home
      navigate('/home');
    }
  }, [navigate, location.state]);

  // Get the address for the selected network - memoized to prevent QR refresh
  const fullAddress = useMemo(() => {
    if (currentWallet?.addresses?.[selectedNetwork.id]) {
      return currentWallet.addresses[selectedNetwork.id];
    }
    return MOCK_ADDRESSES[selectedNetwork.id];
  }, [currentWallet, selectedNetwork.id]);

  // Filter and sort networks
  const { frequentNetworks, otherNetworks } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = networks.filter(n => 
      n.name.toLowerCase().includes(query) || 
      n.shortName.toLowerCase().includes(query)
    );
    
    const frequent = filtered.filter(n => frequentNetworkIds.includes(n.id));
    const others = filtered.filter(n => !frequentNetworkIds.includes(n.id));
    
    return { frequentNetworks: frequent, otherNetworks: others };
  }, [searchQuery]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      toast("已复制到剪贴板", { description: "收款地址已复制" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("复制失败", { description: "请手动复制地址" });
    }
  }, [fullAddress]);

  const handleSaveQRCode = useCallback(async () => {
    if (!qrRef.current) return;
    
    setSaving(true);
    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) throw new Error('QR code not found');
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      // Set canvas size with padding and space for text
      const padding = 40;
      const qrSize = 300;
      const textAreaHeight = 100;
      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + padding * 2 + textAreaHeight;
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        // Draw QR code
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        URL.revokeObjectURL(svgUrl);
        
        // Draw network name
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(selectedNetwork.name, canvas.width / 2, qrSize + padding + 35);
        
        // Draw address (split into two lines if too long)
        ctx.fillStyle = '#666666';
        ctx.font = '12px monospace';
        const midPoint = Math.ceil(fullAddress.length / 2);
        const line1 = fullAddress.slice(0, midPoint);
        const line2 = fullAddress.slice(midPoint);
        ctx.fillText(line1, canvas.width / 2, qrSize + padding + 60);
        ctx.fillText(line2, canvas.width / 2, qrSize + padding + 78);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `${selectedNetwork.name}_收款码_${fullAddress.slice(0, 8)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setSaving(false);
        toast("保存成功", { description: "二维码已保存到本地" });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        setSaving(false);
        toast.error("保存失败", { description: "请重试或截图保存" });
      };
      
      img.src = svgUrl;
    } catch (error) {
      setSaving(false);
      toast.error("保存失败", { description: "请重试或截图保存" });
    }
  }, [selectedNetwork.name, fullAddress]);

  const handleSelectNetwork = (network: typeof networks[0]) => {
    setSelectedNetwork(network);
    setIsDrawerOpen(false);
    setSearchQuery('');
  };

  const NetworkItem = ({ network }: { network: typeof networks[0] }) => (
    <button
      onClick={() => handleSelectNetwork(network)}
      className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors rounded-xl ${
        selectedNetwork.id === network.id ? 'bg-accent/10' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
        <ChainIcon chainId={network.id} size="lg" />
      </div>
      <div className="flex flex-col items-start flex-1">
        <span className="font-semibold text-foreground">{network.name}</span>
        <span className="text-xs text-muted-foreground">{network.shortName}</span>
      </div>
      {selectedNetwork.id === network.id && (
        <CheckCircle2 className="w-5 h-5 text-accent" />
      )}
    </button>
  );

  return (
    <AppLayout showBack title="收款" onBack={handleBack}>
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Network Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              选择网络
            </label>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="w-full card-elevated p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                      <ChainIcon chainId={selectedNetwork.id} size="lg" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-foreground">{selectedNetwork.name}</span>
                      <span className="text-xs text-muted-foreground">{selectedNetwork.shortName}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="pb-2">
                  <DrawerTitle>选择网络</DrawerTitle>
                </DrawerHeader>
                
                <div className="px-4 pb-4">
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索网络..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-muted/30 border-0"
                    />
                  </div>

                  {/* Frequent Networks */}
                  {frequentNetworks.length > 0 && !searchQuery && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        <span className="text-xs font-medium text-muted-foreground">常用网络</span>
                      </div>
                      <div className="space-y-1">
                        {frequentNetworks.map((network) => (
                          <NetworkItem key={network.id} network={network} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Networks or Search Results */}
                  <div>
                    {!searchQuery && otherNetworks.length > 0 && (
                      <span className="text-xs font-medium text-muted-foreground mb-2 block">其他网络</span>
                    )}
                    {searchQuery && frequentNetworks.length === 0 && otherNetworks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        未找到匹配的网络
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {searchQuery ? (
                          [...frequentNetworks, ...otherNetworks].map((network) => (
                            <NetworkItem key={network.id} network={network} />
                          ))
                        ) : (
                          otherNetworks.map((network) => (
                            <NetworkItem key={network.id} network={network} />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card-elevated p-4 text-center mb-4"
          >
            <div ref={qrRef} className="w-40 h-40 mx-auto bg-white rounded-xl p-3 mb-3 shadow-sm">
              <QRCodeSVG
                value={fullAddress}
                size={136}
                level="M"
                includeMargin={false}
                className="w-full h-full"
              />
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
              onClick={handleSaveQRCode}
              disabled={saving}
            >
              <Download className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存二维码'}
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
