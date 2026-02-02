
# 交易列表页面懒加载实现方案

## 目标
为交易历史页面（`/history`）实现懒加载（无限滚动）效果，当用户滚动到列表底部时，自动加载更多交易记录。

## 实现方案

### 核心技术
使用 **react-intersection-observer** 库实现懒加载，这是一个轻量级的库，提供简洁的 `useInView` Hook 来检测元素是否进入视口。

### 实现步骤

#### 1. 安装依赖
```bash
npm install react-intersection-observer
```

#### 2. 创建自定义 Hook：useInfiniteTransactions
创建一个可复用的 Hook 来管理懒加载逻辑：

- 维护当前页码（`page`）
- 维护是否还有更多数据（`hasMore`）
- 维护加载状态（`isLoadingMore`）
- 提供加载更多的方法

#### 3. 修改 History.tsx 页面

**状态管理变更：**
- 添加 `displayedCount` 状态：控制当前显示的交易数量
- 添加 `isLoadingMore` 状态：显示加载更多时的状态
- 使用 `useInView` Hook 监听滚动触发器

**分页逻辑：**
- 每页显示 10 条交易记录
- 当滚动触发器进入视口时，增加 `displayedCount`
- 使用 `useMemo` 根据 `displayedCount` 切片显示数据

**UI 变更：**
- 在交易列表底部添加滚动触发器元素
- 添加加载更多的 Loading 状态显示
- 当没有更多数据时显示"已加载全部"提示

### 代码结构示意

```text
┌──────────────────────────────────┐
│         交易列表页面              │
├──────────────────────────────────┤
│  [搜索框] [链筛选]               │
│  [全部] [转出] [收入] [风险]      │
├──────────────────────────────────┤
│  今天                            │
│  ┌─────────────────────────┐    │
│  │ 交易项 1                │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 交易项 2                │    │
│  └─────────────────────────┘    │
│         ...                      │
│  ┌─────────────────────────┐    │
│  │ 交易项 10               │    │
│  └─────────────────────────┘    │
├──────────────────────────────────┤
│  [滚动触发器 - 不可见]           │◄── useInView 监听
│  [加载中...] 或 [已加载全部]     │
└──────────────────────────────────┘
```

---

## 技术细节

### 文件变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `package.json` | 修改 | 添加 `react-intersection-observer` 依赖 |
| `src/hooks/useInfiniteScroll.tsx` | 新建 | 创建可复用的无限滚动 Hook |
| `src/pages/History.tsx` | 修改 | 集成懒加载逻辑 |

### useInfiniteScroll Hook 设计

```typescript
interface UseInfiniteScrollOptions<T> {
  data: T[];                    // 完整数据
  pageSize?: number;            // 每页数量，默认 10
  initialCount?: number;        // 初始显示数量
}

interface UseInfiniteScrollReturn<T> {
  displayedData: T[];           // 当前显示的数据
  hasMore: boolean;             // 是否有更多
  isLoadingMore: boolean;       // 是否正在加载
  loadMore: () => void;         // 加载更多方法
  scrollTriggerRef: (node?: Element | null) => void;  // 触发器 ref
}
```

### History.tsx 关键修改

1. **导入新依赖**
```typescript
import { useInView } from 'react-intersection-observer';
```

2. **添加状态**
```typescript
const [displayedCount, setDisplayedCount] = useState(10);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const { ref: scrollTriggerRef, inView } = useInView({ threshold: 0 });
```

3. **加载更多逻辑**
```typescript
useEffect(() => {
  if (inView && displayedCount < filteredTransactions.length) {
    setIsLoadingMore(true);
    // 模拟加载延迟，实际项目可移除
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 10, filteredTransactions.length));
      setIsLoadingMore(false);
    }, 300);
  }
}, [inView, displayedCount, filteredTransactions.length]);
```

4. **修改数据切片**
```typescript
const displayedTransactions = useMemo(() => {
  return filteredTransactions.slice(0, displayedCount);
}, [filteredTransactions, displayedCount]);
```

5. **添加滚动触发器 UI**
```typescript
{/* 滚动触发器 */}
<div ref={scrollTriggerRef} className="h-4" />

{/* 加载状态 */}
{isLoadingMore && (
  <div className="flex justify-center py-4">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
)}

{/* 已加载全部 */}
{!hasMore && displayedCount > 0 && (
  <p className="text-center text-sm text-muted-foreground py-4">
    已加载全部
  </p>
)}
```

### 筛选重置逻辑
当筛选条件（搜索、链、类型）变化时，需要重置 `displayedCount` 到初始值：

```typescript
useEffect(() => {
  setDisplayedCount(10);
}, [filter, chainFilter, searchQuery]);
```

---

## 用户体验优化

1. **平滑加载动画**：新加载的交易项带有渐入动画
2. **防抖处理**：避免快速滚动时重复触发加载
3. **加载状态反馈**：显示旋转的加载图标
4. **完成提示**：所有数据加载完毕后显示"已加载全部"

## 注意事项

- 当前项目使用 Mock 数据，所有交易数据都在内存中，懒加载主要是分批渲染优化
- 如果后续接入真实 API，可以修改为真正的分页请求
- 筛选条件变化时需要重置分页状态
