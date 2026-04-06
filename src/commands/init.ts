import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { StateManager } from '../state/cstackState';
import { install, InstallLocation } from '../install/installer';
import { detectLegacyInstall, offerMigration } from '../install/migrationHelper';
import {
  CSTACK_DIR,
  RUNTIME_DIR,
  SWARM_CONFIG_FILE,
  GITIGNORE_CSTACK_BLOCK,
  SWARM_CONFIG_DEFAULTS_COMMENTED,
} from '../constants';
import { log } from '../outputChannel';

export async function runInit(
  stateManager: StateManager,
  assetsRoot: string
): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders?.length) {
    vscode.window.showErrorMessage('cstack: No workspace folder open.');
    return;
  }

  const root = workspaceFolders[0].uri.fsPath;

  // Check for legacy install
  const legacy = detectLegacyInstall(root);
  let location: InstallLocation = 'global';

  if (legacy.length > 0) {
    const shouldMigrate = await offerMigration(legacy[0]);
    location = legacy[0].type;
    if (!shouldMigrate) {
      log('Init: user chose to keep legacy install');
    }
  } else {
    // Ask for install location
    const choice = await vscode.window.showQuickPick(
      ['Global (~/.agents/skills/)', 'Local (.agents/skills/ in workspace)'],
      {
        placeHolder: 'Where should cstack install skill and agent files?',
        ignoreFocusOut: true,
      }
    );
    if (!choice) return;
    location = choice.startsWith('Global') ? 'global' : 'local';
  }

  // Create .cstack/ directory structure
  fs.mkdirSync(path.join(root, RUNTIME_DIR), { recursive: true });
  log('Created .cstack/runtime/');

  // Create swarm.yaml if not present
  const configPath = path.join(root, SWARM_CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, SWARM_CONFIG_DEFAULTS_COMMENTED, 'utf-8');
    log('Created .cstack/swarm.yaml');
  }

  // Update .gitignore
  updateGitignore(root);

  // Install files
  const installed = install(assetsRoot, location, root);

  await stateManager.updateInstall({
    skillsPath: installed.skillsPath,
    agentsPath: installed.agentsPath,
  });

  vscode.window.showInformationMessage(
    `cstack initialized. Skills installed to: ${installed.skillsPath}`
  );
  log(`Init complete. Location: ${location}`);
}

function updateGitignore(root: string): void {
  const gitignorePath = path.join(root, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('.cstack/runtime/')) {
      return; // Already present
    }
    fs.appendFileSync(gitignorePath, GITIGNORE_CSTACK_BLOCK);
  } else {
    fs.writeFileSync(gitignorePath, GITIGNORE_CSTACK_BLOCK.trim() + '\n');
  }
  log('Updated .gitignore with .cstack/runtime/');
}
