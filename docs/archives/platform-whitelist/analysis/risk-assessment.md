# Risk Assessment

## S.U.P.E.R Architecture Health Summary
改动面集中在 `lib/agents.ts`（过滤）+ `settingsStore`（持久化）+ `SettingsView`（配置 UI），均为已存在的健康模块，无新增违反点。

| Principle | Status | 说明 |
|:----------|:-------|:-----|
| S | 🟢 | 过滤职责清晰 |
| U | 🟢 | 单向数据流 |
| P | 🟢 | 白名单 = `string[]` 契约 |
| E | 🟢 | DB 持久化 |
| R | 🟢 | 单点可替换 |

**Overall Health**：5/5 healthy。

## Risk Matrix
| 风险 | 影响 | 可能性 | 严重度 | 缓解 |
|:-----|:-----|:-------|:-------|:-----|
| 响应式失效：`lib/agents.ts` 读全局 state 非响应式，白名单变更后组件不重渲染 | 高 | 高 | 高 | 让消费组件订阅白名单；或 store 暴露派生 `visibleAgents` 并在白名单变更时重算 |
| 设置页自身需要全量列表配置白名单，若 store 也被过滤则拿不到隐藏项 | 中 | 中 | 中 | store 保留全量 `agents`，白名单仅作用于派生视图；设置页读全量 |
| 隐藏已安装平台 → 孤立安装（无 UI 卸载） | 中 | 中 | 中 | 语义决策（Phase 2 确认） |
| 初次加载时序：白名单未加载即首屏渲染 | 低 | 中 | 低 | 空白名单 = 显示全部，首屏降级安全 |
| 两 store 重复过滤逻辑 | 低 | 高 | 低 | 抽公共 `filterByWhitelist` 工具 |

## 技术债
- `platformStore` 与 `centralSkillsStore` 都独立 fetch `get_agents`（重复），非本次引入，保持现状。

## Testing Risks
- `lib/agents.ts` 过滤逻辑可单测；store 派生可单测；`SettingsView` 白名单卡片可用 RTL 测勾选/持久化。
- 现有 `platformStore` 测试需更新断言（新增 `visibleAgents`）。

## 兼容性
- 空白名单默认显示全部 = 向后兼容，已配置用户才生效。
- 后端零改动。
