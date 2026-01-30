import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact, ChainId } from '@/types/wallet';
import { getChainLabel } from '@/lib/chain-utils';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface ContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  selectedNetwork?: ChainId;
}

export function ContactDrawer({
  open,
  onOpenChange,
  contacts,
  onSelect,
  selectedNetwork,
}: ContactDrawerProps) {
  // Filter contacts by network compatibility
  const filteredContacts = useMemo(() => {
    if (!selectedNetwork || selectedNetwork === 'all') {
      return contacts;
    }

    // EVM compatible networks
    const evmNetworks = ['ethereum', 'bsc'];
    if (evmNetworks.includes(selectedNetwork)) {
      return contacts.filter(contact => evmNetworks.includes(contact.network));
    }

    return contacts.filter(contact => contact.network === selectedNetwork);
  }, [contacts, selectedNetwork]);

  const handleSelect = (contact: Contact) => {
    onSelect(contact);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh] flex flex-col">
        <DrawerHeader className="border-b border-border/50 pb-3 flex-shrink-0">
          <DrawerTitle>选择联系人</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <AnimatePresence mode="wait">
            {filteredContacts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">暂无联系人</p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {filteredContacts.map((contact, index) => (
                  <motion.button
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelect(contact)}
                    className={cn(
                      "w-full p-4 rounded-2xl bg-card border border-border/50",
                      "flex flex-col gap-1 text-left",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    {/* Name + Chain Label */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {contact.name || '未命名地址'}
                      </span>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded flex-shrink-0">
                        {getChainLabel(contact.network as ChainId)}
                      </span>
                    </div>
                    {/* Full Address */}
                    <p className="font-mono text-sm text-muted-foreground break-all">
                      {contact.address}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
