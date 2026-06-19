# Phase 3 · 设置页配置 UI

- [x] **T5** SettingsView 新增白名单卡片：`Card`+`CardHeader`+`CardContent`，全量 `allAgents` 过滤安装目标后两列 checkbox 网格（复用 `rounded-xl ring-1` 视觉），勾选/取消即时 `setPlatformWhitelist`；顶部「已选 N / 共 M」+ 空状态提示；现有 customAgents 列表改读 `allAgents`
  - AC：列出全部安装目标（内置+自定义）；勾选即时持久化生效；customAgents 管理始终显示全部自定义
  - Test：RTL 渲染 + 勾选触发 invoke + 持久化 key
  - 依赖：T1、T3

## Notes
- 卡片位置建议置于「Custom Platforms」之后（平台相关聚合）
