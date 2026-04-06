import * as vscode from 'vscode';
import * as path from 'path';

import { initOutputChannel, log, disposeChannel } from './outputChannel';
import { StateManager } from './state/cstackState';

import { runInit } from './commands/init';
import { runInstallSkills } from './commands/installSkills';
import { runDoctor } from './commands/doctor';

import { EXTENSION_VERSION } from './constants';

let statusBarItem: vscode.StatusBarItem;
let stateManager: StateManager;

export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel();
  log(`cstack v${EXTENSION_VERSION} activating`);

  stateManager = new StateManager(context);

  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = '$(rocket) cstack';
  statusBarItem.tooltip = 'cstack — Engineering team for Copilot';
  statusBarItem.command = 'cstack.doctor';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('cstack.init', () =>
      runInit(stateManager, getAssetsRoot(context))
    ),
    vscode.commands.registerCommand('cstack.installSkills', () =>
      runInstallSkills(stateManager, getAssetsRoot(context))
    ),
    vscode.commands.registerCommand('cstack.doctor', () => runDoctor(stateManager)),
  );

  // Auto-install if configured
  const autoInstall = vscode.workspace
    .getConfiguration('cstack')
    .get<boolean>('autoInstallSkills');
  if (autoInstall) {
    const { install } = require('./install/installer');
    try {
      install(getAssetsRoot(context), 'global');
      log('Auto-installed skills (autoInstallSkills=true)');
    } catch (err) {
      log(`Auto-install failed: ${err}`);
    }
  }

  log('cstack activated');
}

export function deactivate(): void {
  disposeChannel();
}

function getAssetsRoot(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, 'assets');
}
