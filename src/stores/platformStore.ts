import { create } from "zustand";
import { invoke, isTauriRuntime } from "@/lib/tauri";
import { AgentWithStatus, ScanResult } from "@/types";
import { filterAgentsByWhitelist } from "@/lib/agents";
import { useSettingsStore } from "./settingsStore";

const BROWSER_FIXTURE_AGENTS: AgentWithStatus[] = [
  {
    id: "claude-code",
    display_name: "Claude Code",
    category: "coding",
    global_skills_dir: "~/.claude/skills/",
    is_detected: true,
    is_builtin: true,
    is_enabled: true,
  },
  {
    id: "cursor",
    display_name: "Cursor",
    category: "coding",
    global_skills_dir: "~/.cursor/skills/",
    is_detected: true,
    is_builtin: true,
    is_enabled: true,
  },
  {
    id: "central",
    display_name: "Central Skills",
    category: "central",
    global_skills_dir: "~/.agents/skills/",
    is_detected: true,
    is_builtin: true,
    is_enabled: true,
  },
];

const BROWSER_FIXTURE_COUNTS: ScanResult = {
  total_skills: 1,
  agents_scanned: 3,
  skills_by_agent: {
    "claude-code": 1,
    cursor: 1,
    central: 1,
  },
};

/** Derive the visible (whitelist-filtered) agent list from the full list. */
function visibleAgents(allAgents: AgentWithStatus[]): AgentWithStatus[] {
  return filterAgentsByWhitelist(allAgents, useSettingsStore.getState().platformWhitelist);
}

// ─── State ────────────────────────────────────────────────────────────────────

interface PlatformState {
  allAgents: AgentWithStatus[];
  agents: AgentWithStatus[];
  skillsByAgent: Record<string, number>;
  isLoading: boolean;
  isRefreshing: boolean;
  scanGeneration?: number;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  rescan: () => Promise<void>;
  refreshCounts: () => Promise<void>;
  reapplyWhitelist: (whitelist: string[] | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlatformStore = create<PlatformState>((set) => ({
  allAgents: [],
  agents: [],
  skillsByAgent: {},
  isLoading: false,
  isRefreshing: false,
  scanGeneration: 0,
  error: null,

  /**
   * Initialize the store on app mount: load agents then trigger a full scan.
   * Called once from AppShell's useEffect.
   */
  initialize: async () => {
    set({ isLoading: true, error: null });
    if (!isTauriRuntime()) {
      set((state) => ({
        allAgents: BROWSER_FIXTURE_AGENTS,
        agents: visibleAgents(BROWSER_FIXTURE_AGENTS),
        skillsByAgent: BROWSER_FIXTURE_COUNTS.skills_by_agent,
        isLoading: false,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
      return;
    }
    try {
      const [fetched, scanResult] = await Promise.all([
        invoke<AgentWithStatus[]>("get_agents"),
        invoke<ScanResult>("scan_all_skills"),
      ]);
      set((state) => ({
        allAgents: fetched,
        agents: visibleAgents(fetched),
        skillsByAgent: scanResult.skills_by_agent,
        isLoading: false,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  /**
   * Re-trigger a full scan and refresh agent list.
   * Called from manual refresh button.
   */
  rescan: async () => {
    set({ isLoading: true, error: null });
    if (!isTauriRuntime()) {
      set((state) => ({
        allAgents: BROWSER_FIXTURE_AGENTS,
        agents: visibleAgents(BROWSER_FIXTURE_AGENTS),
        skillsByAgent: BROWSER_FIXTURE_COUNTS.skills_by_agent,
        isLoading: false,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
      return;
    }
    try {
      const [fetched, scanResult] = await Promise.all([
        invoke<AgentWithStatus[]>("get_agents"),
        invoke<ScanResult>("scan_all_skills"),
      ]);
      set((state) => ({
        allAgents: fetched,
        agents: visibleAgents(fetched),
        skillsByAgent: scanResult.skills_by_agent,
        isLoading: false,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  refreshCounts: async () => {
    set({ isRefreshing: true, error: null });
    if (!isTauriRuntime()) {
      set((state) => ({
        allAgents: BROWSER_FIXTURE_AGENTS,
        agents: visibleAgents(BROWSER_FIXTURE_AGENTS),
        skillsByAgent: BROWSER_FIXTURE_COUNTS.skills_by_agent,
        isRefreshing: false,
        isLoading: state.isLoading,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
      return;
    }
    try {
      const [fetched, scanResult] = await Promise.all([
        invoke<AgentWithStatus[]>("get_agents"),
        invoke<ScanResult>("scan_all_skills"),
      ]);
      set((state) => ({
        allAgents: fetched,
        agents: visibleAgents(fetched),
        skillsByAgent: scanResult.skills_by_agent,
        isRefreshing: false,
        isLoading: state.isLoading,
        scanGeneration: (state.scanGeneration ?? 0) + 1,
      }));
    } catch (err) {
      set({ error: String(err), isRefreshing: false });
    }
  },

  /**
   * Recompute the visible agent list from the cached full list after the
   * platform whitelist changes. Triggered by the settingsStore subscription.
   */
  reapplyWhitelist: (whitelist) =>
    set((state) => ({
      agents: filterAgentsByWhitelist(state.allAgents, whitelist),
    })),
}));

// Keep the visible agent list in sync with the platform whitelist.
useSettingsStore.subscribe((state, prev) => {
  if (state.platformWhitelist !== prev.platformWhitelist) {
    usePlatformStore.getState().reapplyWhitelist(state.platformWhitelist);
  }
});
