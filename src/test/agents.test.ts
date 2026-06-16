import { describe, it, expect } from "vitest";
import { AgentWithStatus } from "../types";
import { filterAgentsByWhitelist, isInstallTargetAgent } from "../lib/agents";

function mk(id: string, extra: Partial<AgentWithStatus> = {}): AgentWithStatus {
  return {
    id,
    display_name: id,
    category: "coding",
    global_skills_dir: `~/.${id}/skills/`,
    is_detected: true,
    is_builtin: true,
    is_enabled: true,
    ...extra,
  };
}

const central = mk("central");
const obsidian = mk("obsidian");
const claude = mk("claude-code");
const cursor = mk("cursor");

describe("isInstallTargetAgent", () => {
  it("excludes central and obsidian", () => {
    expect(isInstallTargetAgent(central)).toBe(false);
    expect(isInstallTargetAgent(obsidian)).toBe(false);
    expect(isInstallTargetAgent(claude)).toBe(true);
  });
});

describe("filterAgentsByWhitelist", () => {
  it("returns all agents when whitelist is null (not loaded)", () => {
    const all = [central, claude, cursor];
    expect(filterAgentsByWhitelist(all, null)).toEqual(all);
  });

  it("keeps non-install-targets (central/obsidian) regardless of whitelist", () => {
    expect(filterAgentsByWhitelist([central, obsidian, claude], [])).toEqual([
      central,
      obsidian,
    ]);
  });

  it("empty whitelist hides all install-target platforms", () => {
    expect(filterAgentsByWhitelist([central, claude, cursor], [])).toEqual([central]);
  });

  it("only whitelisted install-targets pass", () => {
    expect(filterAgentsByWhitelist([central, claude, cursor], ["claude-code"])).toEqual([
      central,
      claude,
    ]);
  });

  it("ignores whitelist ids not present in agents", () => {
    expect(
      filterAgentsByWhitelist([central, claude], ["cursor", "claude-code"])
    ).toEqual([central, claude]);
  });
});
