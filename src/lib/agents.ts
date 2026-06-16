import type { AgentWithStatus } from "@/types";

export const CENTRAL_AGENT_ID = "central";
export const OBSIDIAN_AGENT_ID = "obsidian";

const NON_INSTALL_TARGET_AGENT_IDS = new Set([
  CENTRAL_AGENT_ID,
  OBSIDIAN_AGENT_ID,
]);

export function isInstallTargetAgent(agent: Pick<AgentWithStatus, "id">): boolean {
  return !NON_INSTALL_TARGET_AGENT_IDS.has(agent.id);
}

export function isEnabledInstallTargetAgent(
  agent: Pick<AgentWithStatus, "id" | "is_enabled">
): boolean {
  return isInstallTargetAgent(agent) && agent.is_enabled;
}

/**
 * Apply the platform whitelist to a full agent list.
 * - `whitelist === null` means "not loaded yet" → show all (safe pre-load default).
 * - Otherwise: non-install-target agents (central/obsidian) always pass;
 *   install-target agents pass only when their id is in the whitelist
 *   (empty array → no platforms shown).
 */
export function filterAgentsByWhitelist(
  agents: AgentWithStatus[],
  whitelist: string[] | null
): AgentWithStatus[] {
  if (whitelist === null) return agents;
  const allowed = new Set(whitelist);
  return agents.filter((a) => !isInstallTargetAgent(a) || allowed.has(a.id));
}
