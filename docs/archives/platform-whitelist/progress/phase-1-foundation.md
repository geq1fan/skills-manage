# Phase 1 · 基础（持久化 + 过滤工具）

- [x] **T1** settingsStore 增 `platformWhitelist: string[]` + `loadPlatformWhitelist()`（key `platform_whitelist`，JSON.parse 容错）+ `setPlatformWhitelist(ids)`（JSON.stringify 持久化 + 触发 store reapply）；i18n 增 `settings.platformWhitelist*`（中英）
  - AC：往返一致；空/损坏容错 `[]`；i18n 齐全
  - Test：往返单测 + 损坏 JSON 容错
- [x] **T2** `lib/agents.ts` 新增 `filterAgentsByWhitelist(allAgents, whitelist)`：非安装目标直通，安装目标仅白名单内通过
  - AC：central/obsidian 保留；空数组仅留非安装目标
  - Test：分支单测

## Notes
- T1 ∥ T2 可并行（不同文件）
- `setPlatformWhitelist` 末尾的 reapply 触发在 T4 接线，T1 仅保留调用点
