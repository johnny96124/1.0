
# Asset Detail Page Chain-Aware Transfer Flow

## Overview
Enhance the asset detail page to handle chain selection before initiating transfers or receiving, based on the current filter context.

## User Flow

**Scenario 1: All Chains View**
```text
User on Asset Detail (USDT, All chains)
    |
    +--> Clicks "Transfer" or "Receive"
    |
    +--> Chain Selection Drawer opens
    |     - Shows available chains for this asset
    |     - Shows balance per chain
    |
    +--> User selects a chain (e.g., Ethereum)
    |
    +--> Navigates to Send/Receive page with asset+chain pre-selected
```

**Scenario 2: Specific Chain View**
```text
User on Asset Detail (USDT, ETH chain selected)
    |
    +--> Clicks "Transfer"
    |
    +--> Directly navigates to Send page
    |     - Asset: USDT on Ethereum
    |     - Skips asset selection step
    |     - Starts at address input
```

## Technical Implementation

### 1. Create ChainSelectDrawer Component
**New file: `src/components/ChainSelectDrawer.tsx`**

A reusable drawer component for selecting a chain when initiating from "All" view:
- Props: `open`, `onOpenChange`, `assetSymbol`, `chains[]`, `onSelectChain`
- Display each chain with:
  - Chain icon and name
  - Balance for this asset on that chain
  - USD value
- Styled consistently with existing drawer components

### 2. Modify AssetDetail.tsx

**Add state and handlers:**
- New state: `showChainSelectDrawer`, `pendingAction` (to track if "send" or "receive")
- Handler `handleTransfer()`:
  - If `selectedChain === 'all'`: open chain select drawer with action = 'send'
  - Else: navigate to `/send?asset=SYMBOL&chain=CHAIN_ID`
- Handler `handleReceive()`:
  - If `selectedChain === 'all'`: open chain select drawer with action = 'receive'
  - Else: navigate to `/receive?chain=CHAIN_ID`
- Handler `handleChainSelected(chainId)`:
  - If pending action is 'send': navigate to `/send?asset=SYMBOL&chain=CHAIN_ID`
  - If pending action is 'receive': navigate to `/receive?chain=CHAIN_ID`

**Update button onClick handlers:**
```tsx
<Button onClick={handleTransfer}>转账</Button>
<Button onClick={handleReceive}>收款</Button>
```

### 3. Modify Send.tsx

**Enhance URL parameter parsing:**
- Parse `chain` from URL query params (in addition to existing `asset`)
- When both `asset` and `chain` are specified:
  - Find the specific asset matching both symbol AND network
  - Set as `selectedAsset`
  - Skip to `address` step directly

**Update initial asset logic:**
```tsx
const chainFromUrl = searchParams.get('chain') as ChainId | null;
const assetFromUrl = searchParams.get('asset');

const initialAsset = (assetFromUrl && chainFromUrl)
  ? assets.find(a => 
      a.symbol.toUpperCase() === assetFromUrl.toUpperCase() && 
      a.network === chainFromUrl
    )
  : assetFromUrl 
    ? assets.find(a => a.symbol.toUpperCase() === assetFromUrl.toUpperCase())
    : null;
```

### 4. Modify Receive.tsx

**Add URL parameter support:**
- Parse `chain` from URL query params
- Pre-select the network if chain is specified in URL:
```tsx
const searchParams = new URLSearchParams(location.search);
const chainFromUrl = searchParams.get('chain') as Exclude<ChainId, 'all'> | null;

const initialNetwork = chainFromUrl 
  ? networks.find(n => n.id === chainFromUrl) || networks[0]
  : networks[0];

const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ChainSelectDrawer.tsx` | New component |
| `src/pages/AssetDetail.tsx` | Add chain selection drawer, update navigation logic |
| `src/pages/Send.tsx` | Parse chain from URL, find asset by symbol+network |
| `src/pages/Receive.tsx` | Parse chain from URL, pre-select network |

## Component Design: ChainSelectDrawer

```tsx
interface ChainSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // "选择转账网络" or "选择收款网络"
  assetSymbol: string;
  chains: { network: ChainId; balance: number; usdValue: number }[];
  onSelectChain: (chainId: ChainId) => void;
}
```

The drawer will display:
- Header with title
- List of available chains with:
  - Chain icon (ChainIcon component)
  - Chain name
  - Asset balance on that chain
  - USD value
- Tappable rows that trigger `onSelectChain`

## Edge Cases

1. **Asset only exists on one chain**: If the asset data shows only one chain in `chains[]`, skip the drawer and navigate directly
2. **Zero balance on a chain**: Still show the chain option but with 0 balance displayed
3. **Back navigation**: When user navigates back from Send/Receive, the chain selection should reset appropriately
