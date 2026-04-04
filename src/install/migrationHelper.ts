import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { log } from '../outputChannel';

export interface LegacyInstall {
  type: 'global' | 'local';
  skillsPath: string;
  agentsPath: string;
}

/**
 * Detects v0.1 script-based installs (the bash/PowerShell setup scripts placed
 * files at known paths). Returns detected installs or empty array.
 */
export function detectLegacyInstall(workspaceRoot: string): LegacyInstall[] {
  const found: LegacyInstall[] = [];
  const home = os.homedir();

  // Global locations used by v0.1 setup script
  const globalSkills = path.join(home, '.vscode', 'agents', 'skills');
  const globalAgents = path.join(home, '.github', 'agents');

  if (hasCstackSkills(globalSkills)) {
    found.push({
      type: 'global',
      skillsPath: globalSkills,
      agentsPath: globalAgents,
    });
  }

  // Local locations used by v0.1 setup script --local
  const localSkills = path.join(workspaceRoot, '.agents', 'skills');
  const localAgents = path.join(workspaceRoot, '.github', 'agents');

  if (hasCstackSkills(localSkills)) {
    found.push({
      type: 'local',
      skillsPath: localSkills,
      agentsPath: localAgents,
    });
  }

  return found;
}

function hasCstackSkills(skillsDir: string): boolean {
  if (!fs.existsSync(skillsDir)) return false;
  // Check for at least one known cstack skill directory
  const known = ['plan', 'implement', 'review', 'test', 'ship', 'debug'];
  return known.some((skill) => fs.existsSync(path.join(skillsDir, skill, 'SKILL.md')));
}

export async function offerMigration(legacy: LegacyInstall): Promise<boolean> {
  const desc = legacy.type === 'global'
    ? `global (~/.vscode/agents/skills/)`
    : `local (.agents/skills/)`;

  const choice = await vscode.window.showInformationMessage(
    `cstack: Existing ${desc} install detected (v0.1 setup script). Migrate to extension management?`,
    { modal: false },
    'Yes, migrate',
    'Keep scripts'
  );

  if (choice !== 'Yes, migrate') {
    log(`Migration declined for ${desc} install`);
    return false;
  }

  log(`Migrating ${desc} install — files will be managed by extension from now on`);
  return true;
}
