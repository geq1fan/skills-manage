# Project Overview

## Preliminary Direction
新增「平台白名单」配置：设置页勾选需要展示的平台，仅白名单内平台在所有涉及平台处展示。

## Current Architecture
Tauri v2 三层架构：React 前端 `src/` ──IPC──▶ Rust 后端 `src-tauri/src/` ──SQLx──▶ SQLite。

```
React 前端 (Zustand stores + invoke) ──Tauri IPC──▶ Rust commands ──SQLx──▶ SQLite
```

## Technology Stack
| Layer | Current | Target |
|:------|:--------|:-------|
| Language | TypeScript + Rust | 不变 |
| Framework | React 18 + Tauri v2 | 不变 |
| State | Zustand | 不变 |
| Database | SQLite (KV settings 表) | 不变 |

## 平台数据流（本功能核心）
1. 内置 agent 在 Rust `db.rs:607` `builtin_agents()` 定义（55 个），seed 入库
2. 前端 `platformStore` / `centralSkillsStore` 均调用 `invoke("get_agents")` 拿全量列表
3. 后端 `get_agents`（agents.rs:216）**无任何过滤**，返回全量 + 实时 `is_detected`
4. 所有过滤在前端，统一经 `src/lib/agents.ts` 的 `isInstallTargetAgent` / `isEnabledInstallTargetAgent`

## Settings 持久化机制
- `settings` 表：`key TEXT PK, value TEXT NOT NULL`（db.rs:271）
- `get_setting`/`set_setting`（settings.rs:94/103）支持任意字符串，`INSERT OR REPLACE` upsert
- **白名单可序列化为 JSON 数组字符串存入**，零后端改动

## Build & Run
- `pnpm dev` / `pnpm tauri dev`（端口 24200）
- `pnpm test`（Vitest 370+）/ `pnpm typecheck` / `pnpm lint`
- `cd src-tauri && cargo test`

## Project Governance Baseline
- `CLAUDE.md`（项目级，本仓库）+ 全局 `~/.claude/CLAUDE.md`（精简高效、仅针对性改动）
- 无 `AGENTS.md`、无原生 memory 文件
- 本次为 LOCAL_ONLY 本地特性，不引入 GitHub 跟踪
