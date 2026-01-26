
# Token Management Optimization Plan

## Overview

This plan optimizes the token management experience by transforming it from a simple "add token" feature into a comprehensive "manage tokens" feature that supports both adding and removing tokens, simplifies the add flow, and provides better information about each token.

---

## Current State Analysis

### Existing Implementation
- `TokenSearch.tsx`: Displays available tokens with category filters, requires users to select a network after clicking on a token
- `WalletContext.tsx`: Has `addToken()` function but no `removeToken()` function
- `Home.tsx`: Tracks `addedSymbols` by token symbol, shows "Add Token" button

### Issues Identified
1. No delete functionality for tokens
2. Adding a token requires extra step to select network (even when token supports multiple networks)
3. No indication of how many networks support each token
4. UX could be improved with additional features like sorting and batch operations

---

## Implementation Plan

### 1. Rename Component and Update Interface

**File: `src/components/TokenSearch.tsx` -> `src/components/TokenManager.tsx`**

- Rename component to `TokenManager` to reflect expanded functionality
- Change page title from "Add Token" (添加代币) to "Manage Tokens" (管理代币)
- Add two tabs: "Add Token" (添加代币) and "My Tokens" (我的代币)

### 2. Simplify Add Token Flow

**File: `src/components/TokenManager.tsx`**

When user clicks to add a token:
- Automatically add the token across ALL supported networks (no network selection modal)
- Show network count badge next to token name (e.g., "3 chains" / "3 链")
- Display small chain icons showing which networks are supported

```text
Before:
[Click Token] → [Select Network Modal] → [Added to 1 network]

After:
[Click Token] → [Immediately added to ALL supported networks]
```

### 3. Add Delete Token Functionality

**File: `src/contexts/WalletContext.tsx`**

Add new function to WalletContext:
```typescript
removeToken: (symbol: string, network?: ChainId) => void;
// If network is undefined, remove token from all networks
// If network is specified, remove only from that network
```

**File: `src/components/TokenManager.tsx`**

In the "My Tokens" tab:
- Show list of currently added tokens with their network distribution
- Swipe left or click delete icon to remove a token (with confirmation dialog)
- Option to remove from all networks or specific network

### 4. Display Network Support Information

**File: `src/components/TokenManager.tsx`**

For each token in the list:
- Show number of supported networks as a badge next to token name
- Display small chain icons (e.g., ETH, TRX, BSC icons) next to the token
- Format: "USDT · 3 chains" or "USDT · 3 链"

Visual layout for each token row:
```text
+----------------------------------------------------------+
| [TokenIcon] USDT                      [$1.00] [+0.01%]   |
|             Tether USD                [ETH][TRX][BSC]    |
|             3 链                                [+/-]    |
+----------------------------------------------------------+
```

### 5. Additional Value-Add Features

**A. Sorting Options**
- Sort by: Name (A-Z), Price (High-Low), 24h Change
- Add sort dropdown in header area

**B. Quick Actions**
- Long-press or swipe gestures for quick add/remove
- Batch select mode for adding/removing multiple tokens

**C. Token Status Indicators**
- Green checkmark for fully added tokens (all networks)
- Partial indicator for tokens added on some networks only
- Balance preview for already-added tokens

**D. Empty State for "My Tokens" Tab**
- When no tokens are added, show friendly empty state with CTA to add tokens

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/TokenSearch.tsx` | Rename to `TokenManager.tsx`, add tabs, remove network selection modal, add delete functionality, display chain count |
| `src/contexts/WalletContext.tsx` | Add `removeToken()` function, update type definitions |
| `src/pages/Home.tsx` | Update import and component usage, pass removal handler |
| `src/types/wallet.ts` | Update WalletContextType interface if needed |

---

## UI/UX Specifications

### Tab Design
- Two pill-style tabs at the top: "添加代币" | "我的代币"
- Active tab has accent background color

### Token Card in Add Tab
```text
+----------------------------------------------------------+
| [Icon] USDT                              $1.00  [+]      |
|        Tether USD · 支持 3 链            +0.01%          |
|        [ETH] [TRX] [BSC]                                 |
+----------------------------------------------------------+
```

### Token Card in My Tokens Tab
```text
+----------------------------------------------------------+
| [Icon] USDT                              余额: 12,580.50 |
|        Tether USD                        ≈ $12,580.50    |
|        [ETH✓] [TRX✓] [BSC✓]                       [🗑️]   |
+----------------------------------------------------------+
```

### Delete Confirmation Dialog
- Title: "删除代币"
- Message: "确定要从钱包中删除 {symbol} 吗？此操作不会影响您的链上资产。"
- Buttons: "取消" | "删除"

---

## Technical Details

### New Context Function
```typescript
// In WalletContext.tsx
const removeToken = useCallback((symbol: string, network?: ChainId) => {
  setAssets(prev => {
    if (network) {
      // Remove from specific network
      return prev.filter(a => !(a.symbol === symbol && a.network === network));
    }
    // Remove from all networks
    return prev.filter(a => a.symbol !== symbol);
  });
}, []);
```

### Updated addToken for Multi-Network
```typescript
// Modified to add token on all supported networks
const handleAddToken = (token: TokenInfo) => {
  token.networks.forEach(network => {
    addToken(token.symbol, token.name, network, token.price, token.change24h);
  });
  toast.success(`已添加 ${token.symbol} (${token.networks.length} 个网络)`);
};
```

### Props Interface Update
```typescript
interface TokenManagerProps {
  addedSymbols: string[];
  addedAssets: Asset[]; // For showing current balances
  onAddToken: (token: TokenInfo) => void; // Simplified - no network param
  onRemoveToken: (symbol: string, network?: ChainId) => void;
  onClose: () => void;
}
```

---

## Animation & Transitions

- Tab switching: Slide content left/right with fade
- Token add: Scale up + fade in checkmark
- Token remove: Slide out to left + fade
- Delete confirmation: Bottom sheet slide up

---

## Implementation Order

1. Add `removeToken` function to `WalletContext.tsx`
2. Create new `TokenManager.tsx` component (or refactor `TokenSearch.tsx`)
3. Implement tabbed interface with "Add" and "My Tokens" tabs
4. Update add token flow to add all networks automatically
5. Implement delete functionality with confirmation
6. Add chain count badges and chain icons to token rows
7. Update `Home.tsx` to use new component and handlers
8. Add sorting options and empty states

