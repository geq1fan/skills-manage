# Milestones

| Milestone | 目标 | 完成判据 |
|:----------|:-----|:---------|
| M1 · 基础就绪 | 持久化 + 过滤工具可独立验证 | T1+T2 完成；filterAgentsByWhitelist 单测通过；settingsStore 往返通过 |
| M2 · Store 响应式 | 白名单变更驱动全展示点 | T3+T4 完成；改白名单后侧栏/卡片/对话框即时更新 |
| M3 · 配置可用 | 用户可在设置页管理白名单 | T5 完成；卡片全量多选 + 即时持久化 |
| M4 · 交付 | 测试与回归全绿 | T6 完成；typecheck/lint/test/cargo 通过 |

## Adaptive Control（每阶段漂移阈值，按任务数 20/40/60%）
- Phase 1（2 任务）：annotate=1, replan=1, rescope=2
- Phase 2（2 任务）：annotate=1, replan=1, rescope=2
- Phase 3（1 任务）：annotate=1, replan=1, rescope=1
- Phase 4（1 任务）：annotate=1, replan=1, rescope=1
