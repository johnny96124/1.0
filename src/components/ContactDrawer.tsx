import { useState, useMemo } from 'react';
import { Search, X, Plus, Users, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChainIcon } from '@/components/ChainIcon';
import { Contact, ChainId, SUPPORTED_CHAINS } from '@/types/wallet';
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

const NETWORK_FILTERS = [
  { id: 'all', label: '全部' },
  ...SUPPORTED_CHAINS.filter(c => c.id !== 'all').map(c => ({ id: c.id, label: c.shortName })),
];

export function ContactDrawer({
  open,
  onOpenChange,
  contacts,
  onSelect,
  selectedNetwork,
}: ContactDrawerProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNetwork, setActiveNetwork] = useState<string>(selectedNetwork || 'all');

  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        contact =>
          contact.name.toLowerCase().includes(query) ||
          contact.address.toLowerCase().includes(query)
      );
    }

    // Apply network filter
    if (activeNetwork !== 'all') {
      result = result.filter(contact => contact.network === activeNetwork);
    }

    return result;
  }, [contacts, searchQuery, activeNetwork]);

  const handleSelect = (contact: Contact) => {
    onSelect(contact);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleAddNew = () => {
    onOpenChange(false);
    navigate('/profile/contacts/add');
  };

  const formatAddress = (addr: string) => {
    return addr;
  };

  const getAvatarText = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-3">
          <DrawerTitle>选择联系人</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col h-full max-h-[calc(85vh-60px)]">
          {/* Search Bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索名称或地址"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-muted/50 border-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Network Filter */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {NETWORK_FILTERS.map((network) => (
                <button
                  key={network.id}
                  onClick={() => setActiveNetwork(network.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                    activeNetwork === network.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {network.id !== 'all' && (
                    <ChainIcon chainId={network.id as ChainId} size="xs" />
                  )}
                  {network.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add New Contact Button */}
          <div className="px-4 pb-2">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start gap-2"
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4" />
              添加新联系人
            </Button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? '没有找到匹配的联系人' : '暂无联系人'}
                  </p>
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
                      className="w-full p-3 rounded-xl bg-card border border-border/50 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                        getAvatarColor(contact.name)
                      )}>
                        {getAvatarText(contact.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {contact.name}
                          </span>
                          {contact.isWhitelisted && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[10px]">
                              <Shield className="w-2.5 h-2.5" />
                            </span>
                          )}
                          {contact.isOfficial && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                              <Star className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <ChainIcon chainId={contact.network as ChainId} size="xs" />
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatAddress(contact.address)}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
