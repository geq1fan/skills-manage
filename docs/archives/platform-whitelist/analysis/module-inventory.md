# Module Inventory

仅列出与本功能相关的模块（平台展示与设置）。

| 模块 | 职责 | 关键文件 | 复杂度 |
|:-----|:-----|:---------|:-------|
| `lib/agents.ts` | 平台过滤工具函数（**核心 chokepoint**） | `src/lib/agents.ts:6-19` | Low |
| `platformStore` | 加载/缓存全量 agents | `src/stores/platformStore.ts` | Medium |
| `centralSkillsStore` | 中央技能 + 二次加载 agents | `src/stores/centralSkillsStore.ts` | Medium |
| `settingsStore` | 设置 KV 读写 | `src/stores/settingsStore.ts` | Low |
| `SettingsView` | 设置页（卡片分区） | `src/pages/SettingsView.tsx` | High |
| `Sidebar` | 平台导航（LOBSTER/CODING） | `src/components/layout/Sidebar.tsx:149` | Medium |
| `UnifiedSkillCard` | 平台图标行（唯一卡片组件） | `src/components/skill/UnifiedSkillCard.tsx:185` | Medium |
| `InstallDialog` / `CollectionInstallDialog` | 安装目标勾选 | `src/components/central/InstallDialog.tsx:46` / `collection/CollectionInstallDialog.tsx:42` | Medium |
| `SkillDetailView` | 安装状态侧栏 | `src/components/skill/SkillDetailView.tsx:633` | High |
| `GlobalSearchDialog` | 平台搜索结果 | `src/components/layout/GlobalSearchDialog.tsx:177` | Low |

## 16 个平台展示点（全部源自两个 store）

经 `isInstallTargetAgent` / `isEnabledInstallTargetAgent` 过滤的 10 处：
Sidebar.tsx:149、UnifiedSkillCard.tsx:185、InstallDialog.tsx:46、CollectionInstallDialog.tsx:42、PlatformInstallDrawer.tsx:48、SkillDetailView.tsx:633、GlobalSearchDialog.tsx:177、DiscoverView.tsx:285、DiscoverConfigDialog.tsx:54、ObsidianVaultView.tsx:91

透传 agents 给子组件的 6 处：CentralSkillsView（×4）、CollectionView（×2）、PlatformView、DiscoverView、MarketplaceView、ObsidianVaultView。

> **架构结论**：在 `lib/agents.ts` 的两个过滤函数中接入白名单，可让全部 16 个展示点自动生效（单点改动），但需解决 React 响应式（组件须在白名单变更时重渲染）。

## S.U.P.E.R Assessment（聚焦改动面）
- **S**：`lib/agents.ts` 单一职责（平台过滤），白名单接入不破坏其职责 🟢
- **U**：`lib/agents.ts` 被 store/组件单向依赖；若直接读 `settingsStore.getState()` 引入跨 store 读取，仍为单向（无循环） 🟢
- **P**：白名单以 `string[]`（agent id）为契约，JSON 序列化持久化，端口清晰 🟢
- **E**：白名单存 DB settings 表，无硬编码路径 🟢
- **R**：过滤逻辑集中在 `lib/agents.ts`，可整体替换 🟢
