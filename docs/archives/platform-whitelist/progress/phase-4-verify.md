# Phase 4 · 测试与回归校验

- [x] **T6** 补全/更新 `lib/agents`、`settingsStore`、`platformStore`、`SettingsView` 测试；`pnpm typecheck` + `pnpm lint` + `pnpm test` + `cd src-tauri && cargo test`
  - AC：全绿（3 个遗留失败非本次引入）；typecheck/lint 零新增告警
  - 依赖：T1–T5

## Notes
- 后端零改动，cargo test 仅作回归
- 失败用例须确认是否本次引入，非本次引入的不修
