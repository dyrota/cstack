import * as vscode from 'vscode';
import { StateManager } from '../state/cstackState';
import { install, InstallLocation } from '../install/installer';
import { log } from '../outputChannel';

export async function runInstallSkills(
  stateManager: StateManager,
  assetsRoot: string
): Promise<void> {
  const state = stateManager.get();
  const existingPath = state.install.skillsPath;

  let location: InstallLocation;

  if (existingPath) {
    const isGlobal = existingPath.includes('.vscode') || existingPath.startsWith(process.env.HOME ?? '~');
    location = isGlobal ? 'global' : 'local';
    log(`Reinstalling to ${location} path: ${existingPath}`);
  } else {
    const choice = await vscode.window.showQuickPick(
      ['Global (~/.vscode/agents/skills/)', 'Local (.agents/skills/ in workspace)'],
      {
        placeHolder: 'Install location:',
        ignoreFocusOut: true,
      }
    );
    if (!choice) return;
    location = choice.startsWith('Global') ? 'global' : 'local';
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const installed = install(assetsRoot, location, workspaceRoot);

  await stateManager.updateInstall({
    skillsPath: installed.skillsPath,
    agentsPath: installed.agentsPath,
  });

  vscode.window.showInformationMessage(
    `cstack: Skills updated at ${installed.skillsPath}`
  );
}
