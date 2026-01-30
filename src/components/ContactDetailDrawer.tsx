import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/lib/toast';
import { Contact, ChainId, SUPPORTED_CHAINS, RiskColor } from '@/types/wallet';
import { ChainIcon } from '@/components/ChainIcon';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AVAILABLE_CHAINS = SUPPORTED_CHAINS.filter(c => c.id !== 'all');

interface ContactDetailDrawerProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'view' | 'add';
}

export function ContactDetailDrawer({ 
  contact, 
  open, 
  onOpenChange,
  mode = 'view'
}: ContactDetailDrawerProps) {
  const { contacts, addContact, updateContact, removeContact, scanAddressRisk } = useWallet();

  const isAddMode = mode === 'add';

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<ChainId>('ethereum');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [riskResult, setRiskResult] = useState<{ score: RiskColor; reasons: string[] } | null>(null);

  // Reset form when drawer opens or contact changes
  useEffect(() => {
    if (open) {
      if (isAddMode) {
        // Reset to empty state for add mode
        setName('');
        setAddress('');
        setNetwork('ethereum');
        setNotes('');
        setHasChanges(false);
        setRiskResult(null);
      } else if (contact) {
        // Populate with contact data for edit mode
        setName(contact.name || '');
        setAddress(contact.address);
        setNetwork(contact.network as ChainId);
        setNotes(contact.notes || '');
        setHasChanges(false);
        setRiskResult(null);
      }
    }
  }, [open, contact, isAddMode]);

  // Track changes for edit mode
  useEffect(() => {
    if (!isAddMode && contact) {
      const changed = 
        name !== (contact.name || '') ||
        address !== contact.address ||
        network !== contact.network ||
        notes !== (contact.notes || '');
      setHasChanges(changed);
    }
  }, [name, address, network, notes, contact, isAddMode]);

  // Validate address format
  const validateAddress = (addr: string, chain: ChainId): boolean => {
    if (!addr) return false;
    if (chain === 'ethereum' || chain === 'bsc') {
      return /^0x[a-fA-F0-9]{40}$/.test(addr);
    }
    if (chain === 'tron') {
      return /^T[a-zA-Z0-9]{33}$/.test(addr);
    }
    return false;
  };

  const isValidAddress = validateAddress(address, network);

  // Show validation error only when user has entered something
  const showAddressError = address.length > 0 && !isValidAddress;

  // Scan address risk when address changes (only for new/changed addresses)
  useEffect(() => {
    const shouldScan = isValidAddress && address && (isAddMode || (contact && address !== contact.address));
    
    if (shouldScan) {
      setIsScanning(true);
      const timer = setTimeout(async () => {
        const result = await scanAddressRisk(address);
        setRiskResult({ score: result.score, reasons: result.reasons });
        setIsScanning(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isAddMode && address === contact?.address) {
      setRiskResult(null);
    }
  }, [address, isValidAddress, scanAddressRisk, contact, isAddMode]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('已复制', '地址已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      toast.error('请输入联系人名称');
      return;
    }

    // Validate address
    if (!address.trim()) {
      toast.error('请输入地址');
      return;
    }

    if (!isValidAddress) {
      toast.error('地址格式不正确', `请输入有效的 ${network === 'tron' ? 'Tron' : 'EVM'} 地址`);
      return;
    }

    // Check for duplicate address
    const duplicate = contacts.find(
      c => c.address.toLowerCase() === address.toLowerCase() && c.id !== contact?.id
    );
    if (duplicate) {
      toast.error('地址已存在', `该地址已保存为 "${duplicate.name || '未命名地址'}"`);
      return;
    }

    setIsSaving(true);

    try {
      const contactData = {
        name: name.trim(),
        address: address.trim(),
        network,
        notes: notes.trim(),
        tags: [],
        isWhitelisted: false,
        isOfficial: false,
      };

      if (isAddMode) {
        addContact(contactData);
        toast.success('联系人已添加', `${name} 已添加到地址簿`);
        onOpenChange(false);
      } else if (contact) {
        updateContact(contact.id, contactData);
        toast.success('联系人已更新', `${name} 的信息已保存`);
        setHasChanges(false);
      }
    } catch (error) {
      toast.error('保存失败', '请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!contact) return;
    removeContact(contact.id);
    toast.success('联系人已删除', `${contact.name || '未命名地址'} 已从地址簿移除`);
    onOpenChange(false);
    setShowDeleteDialog(false);
  };

  const handleClose = () => {
    // Reset state when closing
    setShowDeleteDialog(false);
    setShowNetworkDrawer(false);
    onOpenChange(false);
  };

  const selectedChain = AVAILABLE_CHAINS.find(c => c.id === network) || AVAILABLE_CHAINS[0];

  // For view mode, don't render if no contact
  if (!isAddMode && !contact) return null;

  // Determine if save button should be enabled
  const canSave = isAddMode 
    ? (name.trim() && address.trim() && isValidAddress)
    : (hasChanges && name.trim() && address.trim() && isValidAddress);

  return (
    <>
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{isAddMode ? '添加联系人' : '联系人详情'}</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="drawer-name">名称 *</Label>
                <Input
                  id="drawer-name"
                  placeholder="输入联系人名称"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {name.length}/20
                </p>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <Label>网络 *</Label>
                <Drawer open={showNetworkDrawer} onOpenChange={setShowNetworkDrawer}>
                  <button 
                    onClick={() => setShowNetworkDrawer(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <ChainIcon chainId={network} size="sm" />
                    <span className="flex-1 text-left">{selectedChain.name}</span>
                  </button>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>选择网络</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-2">
                      {AVAILABLE_CHAINS.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => {
                            setNetwork(chain.id);
                            setShowNetworkDrawer(false);
                            // Clear address if switching between incompatible networks
                            if ((chain.id === 'tron' && address.startsWith('0x')) ||
                                ((chain.id === 'ethereum' || chain.id === 'bsc') && address.startsWith('T'))) {
                              setAddress('');
                              setRiskResult(null);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-xl transition-colors",
                            network === chain.id
                              ? "bg-primary/10 border border-primary"
                              : "bg-muted/50 border border-transparent hover:bg-muted"
                          )}
                        >
                          <ChainIcon chainId={chain.id} size="sm" />
                          <span className="flex-1 text-left font-medium">{chain.name}</span>
                          {network === chain.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="drawer-address">地址 *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="drawer-address"
                    placeholder={network === 'tron' ? 'T...' : '0x...'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value.trim())}
                    className="flex-1 font-mono text-sm"
                  />
                  {!isAddMode && address && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Address validation error */}
                {showAddressError && (
                  <p className="text-xs text-destructive mt-1.5">
                    地址格式不正确
                  </p>
                )}

                {/* Risk scanning indicator */}
                {isScanning && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    正在扫描地址风险...
                  </div>
                )}

                {/* Risk result */}
                {riskResult && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      riskResult.score === 'green' && "bg-success/10 text-success",
                      riskResult.score === 'yellow' && "bg-warning/10 text-warning",
                      riskResult.score === 'red' && "bg-destructive/10 text-destructive"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {riskResult.score === 'green' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {riskResult.score === 'green' && '地址安全'}
                        {riskResult.score === 'yellow' && '中等风险'}
                        {riskResult.score === 'red' && '高风险地址'}
                      </span>
                    </div>
                    {riskResult.reasons.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs opacity-80">
                        {riskResult.reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="drawer-notes">备注</Label>
                <Textarea
                  id="drawer-notes"
                  placeholder="添加备注信息（可选）"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {notes.length}/200
                </p>
              </div>

              {/* Delete Button - Only show in edit mode */}
              {!isAddMode && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-5 h-5" />
                  删除联系人
                </Button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border/50">
              <Button
                onClick={handleSave}
                disabled={isSaving || !canSave}
                size="lg"
                className="w-full"
              >
                {isSaving ? '保存中...' : (isAddMode ? '添加联系人' : '确认修改')}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation - Only for edit mode */}
      {!isAddMode && contact && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除联系人 "{contact.name || '未命名地址'}" 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
