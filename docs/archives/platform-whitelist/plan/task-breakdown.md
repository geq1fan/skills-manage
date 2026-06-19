# Task Breakdown — 平台白名单

## 已确认任务定义
设置页新增「平台白名单」卡片：列出全部安装目标平台（内置 53 + 自定义），多选勾选；仅白名单内平台在全部 16 个展示点显示（**全过滤**，含安装对话框/安装状态）；空白名单（未配置/空数组）= 显示空；持久化到 `settings` 表 key `platform_whitelist`（JSON 数组）；**后端零改动**。

## 架构决策
**store 层派生过滤**（响应式、展示点零改动）：
- `platformStore` / `centralSkillsStore` 各保留 `allAgents`（全量）+ 派生 `agents`（白名单过滤）
- 派生规则：`allAgents.filter(a => !isInstallTargetAgent(a) || whitelist.includes(a.id))` —— central/obsidian 等「非安装目标」始终保留，安装目标仅白名单内保留
- 白名单变更时调 `reapplyWhitelist()` 重算 `agents`，Zustand 通知订阅者重渲染
- 全部 16 个展示点读 `agents`（已过滤），**零改动**
- Settings 配置卡片与 customAgents 改读 `allAgents`（全量）

> 注：空白名单=显示空，故**初始化必须先加载白名单再初始化 store**，否则首屏空闪。

---

## Phase 1 — 基础（持久化 + 过滤工具）

### T1 · settingsStore 白名单 state + i18n — P0 · S
- `settingsStore` 增 `platformWhitelist: string[]`、`loadPlatformWhitelist()`（`get_setting` key `platform_whitelist`，JSON.parse，容错）、`setPlatformWhitelist(ids)`（`set_setting` JSON.stringify + 触发 store reapply）
- i18n：`en.json`/`zh.json` 增 `settings.platformWhitelist`、`platformWhitelistDesc`、`platformWhitelistEmpty`
- **AC**：store 读写持久化往返一致；空/损坏值容错为 `[]`；i18n 键齐全
- **Test**：往返单测；损坏 JSON 容错
- 依赖：无

### T2 · lib/agents.ts filterAgentsByWhitelist 工具 + 单测 — P0 · S
- 新增 `filterAgentsByWhitelist(allAgents, whitelist)`：非安装目标（central/obsidian）直通；安装目标仅 `whitelist.includes(id)` 通过
- **AC**：central/obsidian 始终保留；白名单内平台保留；白名单外安装目标过滤；空数组 → 仅留非安装目标
- **Test**：lib/agents 白名单分支单测
- 依赖：无（与 T1 可并行）

---

## Phase 2 — Store 派生与响应式

### T3 · 两 store 增 allAgents + 派生 agents + reapplyWhitelist — P0 · M
- `platformStore`：fetch 后存 `allAgents`（全量），派生 `agents = filterAgentsByWhitelist(allAgents, whitelist)`；新增 `reapplyWhitelist(whitelist)`
- `centralSkillsStore`：同上
- initialize/rescan/refreshCounts 均在拿到全量后派生 `agents`（读 `useSettingsStore.getState().platformWhitelist`）
- **AC**：`agents` 仅含非安装目标 + 白名单安装目标；whitelist 变更调 reapply 后 `agents` 更新；现有 `skillsByAgent` 等不受影响
- **Test**：派生单测（含 central 保留、空白名单）；更新现有 platformStore 测试断言
- 依赖：T2
- S.U.P.E.R：S🟢 U🟢 P🟢 E🟢 R🟢

### T4 · 接线：初始化顺序 + reapply 触发 + PlatformView allAgents — P0 · S
- App 初始化：`loadPlatformWhitelist()` 完成后再 `platformStore.initialize()` / centralSkillsStore 初始化（避免空闪）
- `setPlatformWhitelist`（T1）末尾调 `usePlatformStore.getState().reapplyWhitelist(ids)` 与 centralSkillsStore 同名
- `PlatformView` 解析当前 agent 改用 `allAgents`（深链到隐藏平台不崩）
- **AC**：白名单变更后侧栏/卡片/对话框即时更新；深链隐藏平台不 undefined
- **Test**：手动/集成验证；无新单测（接线层）
- 依赖：T1、T3

---

## Phase 3 — 设置页配置 UI

### T5 · SettingsView 白名单卡片 + customAgents 用 allAgents — P0 · M
- 新增卡片：`Card` + `CardHeader`(title/desc) + `CardContent`，全量 `allAgents` 过滤安装目标后两列 checkbox 网格（复用卡片视觉：`rounded-xl ring-1`）；勾选/取消即时 `setPlatformWhitelist`
- 卡片顶部状态行：已选 N / 共 M；空状态提示
- customAgents 列表（现有 Custom Platforms 卡片）改读 `allAgents`，避免被白名单过滤影响管理
- **AC**：卡片列出全部安装目标（内置+自定义）；勾选即持久化并即时生效；customAgents 管理始终显示全部自定义平台
- **Test**：RTL 渲染 + 勾选触发 invoke + 持久化 key
- 依赖：T1（i18n/store 方法）、T3（allAgents）

---

## Phase 4 — 测试与回归校验

### T6 · 测试补全 + typecheck/lint/cargo 回归 — P0 · S
- 补全/更新 `lib/agents.test`、`settingsStore.test`、`platformStore.test`、`SettingsView` RTL
- `pnpm typecheck`、`pnpm lint`、`pnpm test`、`cd src-tauri && cargo test`（后端无改动，仅回归）
- **AC**：全绿（已知 3 个遗留失败非本次引入）；typecheck/lint 零新增告警
- 依赖：T1–T5

---

## 并行车道
- **Lane 1**（Phase 1）：T1 ∥ T2（不同文件：settingsStore/i18n vs lib/agents）
- T3（串行，依赖 T2）
- **Lane 2/3**（Phase 2/3 并行）：T4 ∥ T5（不同文件：App/PlatformView vs SettingsView，低合并风险）
- T6 收尾
