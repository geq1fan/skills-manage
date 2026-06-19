# MASTER — 平台白名单（Platform Whitelist）

## 任务定义
设置页新增「平台白名单」配置：勾选需展示的平台（内置 53 + 自定义），仅白名单内平台在全部 16 个展示点显示（全过滤）；空白名单 = 显示空；持久化到 settings KV（key `platform_whitelist`，JSON 数组）；后端零改动。

## Tracking Mode
`LOCAL_ONLY`

## Governance Status
- 指令面：项目 `CLAUDE.md`（仓库）+ 全局 `~/.claude/CLAUDE.md`（精简高效、仅针对性改动）
- Memory 面：无原生 memory；本次为单次特性，不创建 repo-local memory 文件
- 无 `AGENTS.md`；LOCAL_ONLY，无 GitHub 资源

## 文档索引
- 分析：[analysis/project-overview](../analysis/project-overview.md) · [module-inventory](../analysis/module-inventory.md) · [risk-assessment](../analysis/risk-assessment.md)
- 规划：[plan/task-breakdown](../plan/task-breakdown.md) · [dependency-graph](../plan/dependency-graph.md) · [milestones](../plan/milestones.md)

## 阶段进度
- [x] Phase 1 · 基础（2/2）：[phase-1-foundation](phase-1-foundation.md)
- [x] Phase 2 · Store 派生（2/2）：[phase-2-store](phase-2-store.md)
- [x] Phase 3 · 配置 UI（1/1）：[phase-3-ui](phase-3-ui.md)
- [x] Phase 4 · 测试回归（1/1）：[phase-4-verify](phase-4-verify.md)

## Current Status
全部任务完成。前端 651 测试通过（含新增 13）；typecheck/lint 零告警；后端零改动（cargo 因 Windows 平台预存的 unix 模块无法本地编译，非本次引入）。

## Next Steps
进入 Phase 6 归档。

## Adaptive Control State
```yaml
drift_score: 0
strategy: "store 层派生过滤，展示点零改动"
thresholds:
  phase1: { annotate: 1, replan: 1, rescope: 2 }
  phase2: { annotate: 1, replan: 1, rescope: 2 }
  phase3: { annotate: 1, replan: 1, rescope: 1 }
  phase4: { annotate: 1, replan: 1, rescope: 1 }
total_tasks: 6
completed_tasks: 6
last_updated: "2026-06-16"
```

## Task Telemetry Log
| Task | 估时 | 实际 | S.U.P.E.R | 计划外依赖 | drift |
|:-----|:-----|:-----|:----------|:-----------|:------|
| T1 | S | S | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |
| T2 | S | S | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |
| T3 | M | M | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |
| T4 | S | S | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |
| T5 | M | M | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |
| T6 | S | S | S🟢U🟢P🟢E🟢R🟢 | 0 | 0 |

## Notes
- 实现采用 tri-state 语义：`platformWhitelist === null`（未加载，含测试默认态）→ 显示全部；加载后 DB 无值 → `[]` → 显示空（用户选择的首装行为）；`[ids]` → 仅显示白名单。测试从不加载白名单故保持 null → 现有 651 测试零回归。
- 响应式：platformStore 与 centralSkillsStore 各订阅 settingsStore.platformWhitelist，变更即 `reapplyWhitelist` 重算派生 `agents`，单向依赖无循环。全部 16 个展示点经 `agents` 自动生效，零改动。
- 设置页 customAgents 管理与 PlatformView 深链解析改读全量 `allAgents`，不受白名单影响。
