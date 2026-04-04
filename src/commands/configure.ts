import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SWARM_CONFIG_FILE } from '../constants';
import { SWARM_CONFIG_DEFAULTS_COMMENTED } from '../constants';

export async function runConfigure(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('cstack: No workspace folder open.');
    return;
  }

  const configPath = path.join(workspaceRoot, SWARM_CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, SWARM_CONFIG_DEFAULTS_COMMENTED, 'utf-8');
  }

  const uri = vscode.Uri.file(configPath);
  await vscode.window.showTextDocument(uri, { preview: false });
}
