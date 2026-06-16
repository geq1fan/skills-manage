import { describe, it, expect, vi, beforeEach } from "vitest";
import { AgentWithStatus, ScanResult } from "../types";

// Mock Tauri core before importing the store
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
import { usePlatformStore } from "../stores/platformStore";
import { useSettingsStore } from "../stores/settingsStore";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAgents: AgentWithStatus[] = [
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
    id: "central",
    display_name: "Central Skills",
    category: "central",
    global_skills_dir: "~/.agents/skills/",
    is_detected: true,
    is_builtin: true,
    is_enabled: true,
  },
];

const mockScanResult: ScanResult = {
  total_skills: 8,
  agents_scanned: 2,
  skills_by_agent: {
    "claude-code": 5,
    central: 3,
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("platformStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePlatformStore.setState({
      agents: [],
      allAgents: [],
      skillsByAgent: {},
      isLoading: false,
      isRefreshing: false,
      scanGeneration: 0,
      error: null,
    });
    useSettingsStore.setState({ platformWhitelist: null });
    vi.clearAllMocks();
  });

  // ── Initial State ─────────────────────────────────────────────────────────

  it("has correct initial state", () => {
    const state = usePlatformStore.getState();
    expect(state.agents).toEqual([]);
    expect(state.skillsByAgent).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.isRefreshing).toBe(false);
    expect(state.scanGeneration).toBe(0);
    expect(state.error).toBeNull();
  });

  // ── initialize ────────────────────────────────────────────────────────────

  it("sets isLoading to true while initializing", async () => {
    let resolveAgents!: (value: AgentWithStatus[]) => void;
    let resolveScan!: (value: ScanResult) => void;

    vi.mocked(invoke)
      .mockReturnValueOnce(
        new Promise<AgentWithStatus[]>((r) => (resolveAgents = r))
      )
      .mockReturnValueOnce(new Promise<ScanResult>((r) => (resolveScan = r)));

    const initPromise = usePlatformStore.getState().initialize();

    // isLoading should be true while the calls are pending
    expect(usePlatformStore.getState().isLoading).toBe(true);

    resolveAgents(mockAgents);
    resolveScan(mockScanResult);
    await initPromise;
  });

  it("populates agents and skillsByAgent after initialize", async () => {
    vi.mocked(invoke)
      .mockResolvedValueOnce(mockAgents)
      .mockResolvedValueOnce(mockScanResult);

    await usePlatformStore.getState().initialize();

    const state = usePlatformStore.getState();
    expect(state.agents).toEqual(mockAgents);
    expect(state.skillsByAgent).toEqual(mockScanResult.skills_by_agent);
    expect(state.isLoading).toBe(false);
    expect(state.scanGeneration).toBe(1);
    expect(state.error).toBeNull();
  });

  it("calls get_agents and scan_all_skills during initialize", async () => {
    vi.mocked(invoke)
      .mockResolvedValueOnce(mockAgents)
      .mockResolvedValueOnce(mockScanResult);

    await usePlatformStore.getState().initialize();

    expect(invoke).toHaveBeenCalledWith("get_agents");
    expect(invoke).toHaveBeenCalledWith("scan_all_skills");
    expect(invoke).toHaveBeenCalledTimes(2);
  });

  it("sets error and clears isLoading when initialize fails", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Scan failed"));

    await usePlatformStore.getState().initialize();

    const state = usePlatformStore.getState();
    expect(state.error).toContain("Scan failed");
    expect(state.isLoading).toBe(false);
    expect(state.agents).toEqual([]);
  });

  // ── rescan ────────────────────────────────────────────────────────────────

  it("rescan refreshes agents and skill counts", async () => {
    // Start with some existing state
    usePlatformStore.setState({
      agents: mockAgents,
      skillsByAgent: { "claude-code": 2 },
      isLoading: false,
      isRefreshing: false,
      scanGeneration: 1,
      error: null,
    });

    const updatedScanResult: ScanResult = {
      total_skills: 10,
      agents_scanned: 2,
      skills_by_agent: { "claude-code": 7, central: 3 },
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce(mockAgents)
      .mockResolvedValueOnce(updatedScanResult);

    await usePlatformStore.getState().rescan();

    const state = usePlatformStore.getState();
    expect(state.skillsByAgent["claude-code"]).toBe(7);
    expect(state.isLoading).toBe(false);
    expect(state.scanGeneration).toBe(2);
    expect(state.error).toBeNull();
  });

  it("rescan sets error on failure", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Network error"));

    await usePlatformStore.getState().rescan();

    const state = usePlatformStore.getState();
    expect(state.error).toContain("Network error");
    expect(state.isLoading).toBe(false);
  });

  it("refreshCounts updates counts without entering the full loading state", async () => {
    usePlatformStore.setState({
      agents: mockAgents,
      skillsByAgent: { "claude-code": 2, central: 3 },
      isLoading: false,
      isRefreshing: false,
      scanGeneration: 1,
      error: null,
    });

    const updatedScanResult: ScanResult = {
      total_skills: 11,
      agents_scanned: 2,
      skills_by_agent: { "claude-code": 8, central: 3 },
    };

    vi.mocked(invoke)
      .mockResolvedValueOnce(mockAgents)
      .mockResolvedValueOnce(updatedScanResult);

    const refreshPromise = usePlatformStore.getState().refreshCounts();
    expect(usePlatformStore.getState().isLoading).toBe(false);
    expect(usePlatformStore.getState().isRefreshing).toBe(true);

    await refreshPromise;

    const state = usePlatformStore.getState();
    expect(state.skillsByAgent).toEqual(updatedScanResult.skills_by_agent);
    expect(state.isLoading).toBe(false);
    expect(state.isRefreshing).toBe(false);
    expect(state.scanGeneration).toBe(2);
  });

  // ── Platform Whitelist filtering ──────────────────────────────────────────

  it("hides non-whitelisted install-target agents after initialize", async () => {
    useSettingsStore.setState({ platformWhitelist: [] }); // show none
    const all: AgentWithStatus[] = [
      mockAgents[0], // claude-code (install target)
      { ...mockAgents[0], id: "cursor", display_name: "Cursor" },
      mockAgents[1], // central (non-install-target, always kept)
    ];

    vi.mocked(invoke).mockResolvedValueOnce(all).mockResolvedValueOnce(mockScanResult);

    await usePlatformStore.getState().initialize();

    const state = usePlatformStore.getState();
    expect(state.allAgents).toEqual(all);
    expect(state.agents.map((a) => a.id)).toEqual(["central"]);
  });

  it("reapplyWhitelist recomputes the visible list from cached agents", async () => {
    // Load with no whitelist (null → show all)
    vi.mocked(invoke)
      .mockResolvedValueOnce(mockAgents)
      .mockResolvedValueOnce(mockScanResult);
    await usePlatformStore.getState().initialize();
    expect(usePlatformStore.getState().agents).toEqual(mockAgents);

    // Restrict to claude-code only → reapply hides central? No: central is a
    // non-install-target so it is always kept; only install-targets are gated.
    usePlatformStore.getState().reapplyWhitelist(["claude-code"]);
    expect(usePlatformStore.getState().agents.map((a) => a.id)).toEqual([
      "claude-code",
      "central",
    ]);

    // Back to show-all (null)
    usePlatformStore.getState().reapplyWhitelist(null);
    expect(usePlatformStore.getState().agents).toEqual(mockAgents);
  });
});
