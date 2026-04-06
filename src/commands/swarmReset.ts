import * as vscode from 'vscode';
import { SessionManager } from '../swarm/sessionManager';
import { log } from '../outputChannel';

export async function runSwarmReset(sessionManager: SessionManager): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('cstack: No workspace folder open.');
    return;
  }

  await sessionManager.resetSwarm(workspaceRoot);
  vscode.window.showInformationMessage('cstack: Swarm session cleared.');
  log('Swarm reset by user');
}
