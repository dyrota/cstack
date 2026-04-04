import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SWARM_SUMMARY_FILE } from '../constants';

export async function runOpenSummary(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('cstack: No workspace folder open.');
    return;
  }

  const summaryPath = path.join(workspaceRoot, SWARM_SUMMARY_FILE);
  if (!fs.existsSync(summaryPath)) {
    vscode.window.showInformationMessage('cstack: No swarm summary found. Run a swarm first.');
    return;
  }

  const uri = vscode.Uri.file(summaryPath);
  await vscode.window.showTextDocument(uri, { preview: false });
}
