# Phase 2 · Store 派生与响应式

- [x] **T3** `platformStore` + `centralSkillsStore`：fetch 后存 `allAgents`（全量），派生 `agents = filterAgentsByWhitelist(allAgents, whitelist)`；新增 `reapplyWhitelist(whitelist)`；initialize/rescan/refreshCounts 均派生
  - AC：`agents` 仅含非安装目标 + 白名单安装目标；reapply 后更新；skillsByAgent 不受影响
  - Test：派生单测 + 更新 platformStore 现有断言
  - 依赖：T2
- [x] **T4** 接线：App 先 `loadPlatformWhitelist` 再初始化两 store；`setPlatformWhitelist` 末尾调两 store `reapplyWhitelist`；`PlatformView` 解析当前 agent 改用 `allAgents`
  - AC：白名单变更即时更新全展示点；深链隐藏平台不崩
  - 依赖：T1、T3

## Notes
- 空白名单=显示空，故初始化顺序为硬性要求，否则首屏空闪
- T4 ∥ T5（改不同文件，低合并风险）
