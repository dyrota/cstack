import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { StateManager } from '../state/cstackState';
import { log } from '../outputChannel';

interface DoctorCheck {
  name: string;
  pass: boolean;
  detail: string;
}

export async function runDoctor(stateManager: StateManager): Promise<void> {
  const checks: DoctorCheck[] = [];
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  // VS Code version
  const vsVersion = vscode.version;
  checks.push({
    name: 'VS Code version (≥1.99.0)',
    pass: meetsMinVersion(vsVersion, '1.99.0'),
    detail: `Found ${vsVersion}`,
  });

  // Copilot extension present
  const copilot = vscode.extensions.getExtension('GitHub.copilot-chat');
  checks.push({
    name: 'GitHub Copilot Chat extension',
    pass: !!copilot,
    detail: copilot ? `v${copilot.packageJSON.version}` : 'Not found — install GitHub.copilot-chat',
  });

  // Skills installed
  const state = stateManager.get();
  const skillsInstalled = !!(state.install.skillsPath && fs.existsSync(state.install.skillsPath));
  checks.push({
    name: 'Skills installed',
    pass: skillsInstalled,
    detail: state.install.skillsPath ?? 'Not installed — run cstack: Initialize Workspace',
  });

  // .cstack/ directory
  if (workspaceRoot) {
    const hasCstackDir = fs.existsSync(path.join(workspaceRoot, '.cstack'));
    checks.push({
      name: '.cstack/ directory',
      pass: hasCstackDir,
      detail: hasCstackDir ? 'Present' : 'Missing — run cstack: Initialize Workspace',
    });
  }

  // chat.agent.enabled setting
  const agentEnabled = vscode.workspace.getConfiguration('chat').get<boolean>('agent.enabled');
  checks.push({
    name: 'chat.agent.enabled',
    pass: agentEnabled !== false,
    detail: agentEnabled !== false ? 'Enabled' : 'Disabled — enable in VS Code settings',
  });

  // Display results
  const lines = checks.map((c) => `${c.pass ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  const allPass = checks.every((c) => c.pass);
  const summary = allPass ? 'All checks passed.' : 'Some checks failed — see details.';

  log('Doctor results:\n' + lines.join('\n'));

  vscode.window.showInformationMessage(
    `cstack Doctor\n\n${lines.join('\n')}\n\n${summary}`,
    { modal: true },
    'OK'
  );
}

function meetsMinVersion(current: string, min: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [cMaj, cMin] = parse(current);
  const [mMaj, mMin] = parse(min);
  if (cMaj !== mMaj) return cMaj > mMaj;
  return cMin >= mMin;
}
