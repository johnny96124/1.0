

# Alert/Warning Banner Standardization Plan

## Overview

Standardize all inline alert and warning banners across the application with **two distinct visual styles** based on the level of importance:

1. **Red Banner (High-Level Warning/Danger)** - For critical alerts, irreversible actions, or emergency states
2. **Orange Banner (Moderate-Level Important Note)** - For standard warnings, tips, and informational notes

---

## Banner Style Specifications

### Red Banner (Danger/Critical)
Use for: Irreversible actions, critical security warnings, emergency states

| Property | Value |
|----------|-------|
| Background | `bg-destructive/10` |
| Border | `border border-destructive/30` |
| Border Radius | `rounded-xl` |
| Icon Container | `w-8 h-8 rounded-full bg-destructive/20` |
| Icon | `w-4 h-4 text-destructive` |
| Title Color | `text-destructive` |
| Description Color | `text-muted-foreground` |

### Orange Banner (Important Note/Warning)
Use for: Tips, moderate warnings, informational notices

| Property | Value |
|----------|-------|
| Background | `bg-warning-surface` (#FCF5EA) |
| Border | `border border-warning/30` |
| Border Radius | `rounded-xl` |
| Icon Container | `w-8 h-8 rounded-full bg-warning/20` |
| Icon | `w-4 h-4 text-warning` |
| Title Color | `text-foreground` |
| Description Color | `text-muted-foreground` |

---

## Current State Analysis

### Already Using Correct Orange Style
These components already follow the orange banner pattern:
- `src/pages/Onboarding.tsx` (line 369) - Wallet creation warning
- `src/pages/Send.tsx` (line 336) - Transfer limit warning
- `src/pages/WalletManagement.tsx` (line 148) - Backup incomplete warning
- `src/pages/WalletEscape.tsx` (line 414) - Export key security tip
- `src/pages/AuthorizeDevice.tsx` (line 163) - Security tip

### Needs Update - SecurityBanner Component
`src/components/ui/SecurityBanner.tsx` currently uses `bg-destructive/10` and `bg-warning/10` inconsistently. This component should support both red and orange styles based on the alert type.

### Needs Classification and Update

| File | Current Style | Should Be | Reason |
|------|---------------|-----------|--------|
| `SecurityBanner.tsx` (error type) | `bg-destructive/10` | **Orange** | Backup reminder is not critical |
| `SecurityBanner.tsx` (warning type) | `bg-warning/10` | **Orange** (use surface) | Consistency |
| `RiskReturn.tsx` (line 115) | `bg-destructive/10` | **Red** | Irreversible action warning |
| `WalletRecovery.tsx` (line 542) | `bg-destructive/10` | **Red** | Private key import danger |
| `WalletEscape.tsx` (line 148) | `bg-destructive/10` | **Red** | MPC escape danger state |

---

## Implementation Changes

### 1. Update SecurityBanner Component
**File**: `src/components/ui/SecurityBanner.tsx`

Change the banner styling to use the orange pattern for all states (backup reminders are important but not critical):

```text
Before                          After
─────────────────────────────────────────────────
bg-destructive/10          →    bg-warning-surface
border-destructive/20      →    border-warning/30
bg-destructive/20 (icon)   →    bg-warning/20
text-destructive           →    text-warning (icon) / text-foreground (title)
```

### 2. Keep Red Style for Danger States
The following should **keep** the red destructive style (they represent truly dangerous/irreversible actions):

- **RiskReturn.tsx** - "退回操作不可撤销" (Return action cannot be undone)
- **WalletRecovery.tsx** - Private key import warning (loses MPC protection)
- **WalletEscape.tsx** - MPC escape danger header (irreversible)

### 3. Ensure Consistent Structure
All banners should follow this unified structure:

```tsx
<div className="p-4 bg-{color} border border-{color}/30 rounded-xl">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-{color}/20 flex items-center justify-center shrink-0">
      <AlertTriangle className="w-4 h-4 text-{color}" strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-{title-color}">Title</p>
      <p className="text-xs text-muted-foreground mt-0.5">Description</p>
    </div>
  </div>
</div>
```

---

## Files to Modify

| File | Change Summary |
|------|----------------|
| `src/components/ui/SecurityBanner.tsx` | Update to use orange warning-surface style |

---

## Files to Keep Unchanged (Correct Red Style)

| File | Reason |
|------|--------|
| `src/pages/RiskReturn.tsx` | Irreversible action (return funds) |
| `src/pages/WalletRecovery.tsx` | Private key import (loses MPC) |
| `src/pages/WalletEscape.tsx` | MPC escape danger state |

---

## Files Already Correct (Orange Style)

| File | Location |
|------|----------|
| `src/pages/Onboarding.tsx` | Line 369 - Creation warning |
| `src/pages/Send.tsx` | Line 336 - Transfer limit |
| `src/pages/WalletManagement.tsx` | Line 148 - Backup reminder |
| `src/pages/WalletEscape.tsx` | Line 414 - Export tip |
| `src/pages/AuthorizeDevice.tsx` | Line 163 - Security tip |

---

## Visual Summary

```text
┌─────────────────────────────────────────────────────┐
│  🔴 RED BANNER (Danger/Critical)                    │
│  ─────────────────────────────────────────────────  │
│  • Irreversible actions                             │
│  • Losing security protections                      │
│  • Emergency states                                 │
│                                                     │
│  Examples:                                          │
│  - "退回操作不可撤销" (Cannot undo)                  │
│  - "私钥导入将失去 MPC 保护"                         │
│  - "MPC 逃逸" (Escape warning)                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🟠 ORANGE BANNER (Important Note/Warning)          │
│  ─────────────────────────────────────────────────  │
│  • Backup reminders                                 │
│  • Security tips                                    │
│  • Transfer limit notices                           │
│  • General informational warnings                   │
│                                                     │
│  Examples:                                          │
│  - "请完成资产保险箱备份"                            │
│  - "创建过程中请勿关闭 App"                          │
│  - "首次转账建议先小额验证"                          │
│  - "请确认是您本人在操作"                            │
└─────────────────────────────────────────────────────┘
```

---

## Expected Outcome

After implementation:
- All inline alert/warning banners will use one of two consistent visual styles
- Users can immediately distinguish between critical (red) and informational (orange) alerts
- The SecurityBanner component on the home page will use the orange style for backup reminders
- Truly dangerous actions (MPC escape, irreversible operations) retain the red style

