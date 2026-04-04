import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { initOutputChannel, log, disposeChannel } from './outputChannel';
import { StateManager } from './state/cstackState';
import { SessionManager } from './swarm/sessionManager';
import { EscalationHandler } from './swarm/escalationHandler';

import { runInit } from './commands/init';
import { runInstallSkills } from './commands/installSkills';
import { runSwarmReset } from './commands/swarmReset';
import { runDoctor } from './commands/doctor';
import { runOpenSummary } from './commands/openSummary';
import { runConfigure } from './commands/configure';

import { SWARM_TRIGGER_FILE, EXTENSION_VERSION } from './constants';
import { SwarmTrigger } from './types';

let statusBarItem: vscode.StatusBarItem;
let stateManager: StateManager;
let sessionManager: SessionManager;
let escalationHandler: EscalationHandler;

export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel();
  log(`cstack v${EXTENSION_VERSION} activating`);

  stateManager = new StateManager(context);
  sessionManager = new SessionManager(stateManager);
  escalationHandler = new EscalationHandler(stateManager);

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
    vscode.commands.registerCommand('cstack.swarmReset', () =>
      runSwarmReset(sessionManager)
    ),
    vscode.commands.registerCommand('cstack.doctor', () => runDoctor(stateManager)),
    vscode.commands.registerCommand('cstack.openSummary', () => runOpenSummary()),
    vscode.commands.registerCommand('cstack.configure', () => runConfigure()),

    // Internal command invoked by the router agent via a well-known trigger mechanism
    vscode.commands.registerCommand('cstack.triggerSwarm', async (args: SwarmTrigger) => {
      await handleSwarmTrigger(args);
    })
  );

  // Start watching workspace for swarm triggers
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    sessionManager.startWatching(workspaceRoot);

    // Check for stale trigger from previous session
    if (sessionManager.checkForStaleTrigger(workspaceRoot)) {
      log('Stale swarm trigger found — processing on activation');
      const triggerUri = vscode.Uri.file(
        path.join(workspaceRoot, SWARM_TRIGGER_FILE)
      );
      // Re-process the stale trigger
      setTimeout(() => {
        vscode.commands.executeCommand('cstack.init');
      }, 1000);
    }

    // Warn about incomplete swarm in status bar
    if (stateManager.hasIncompleteSwarm()) {
      statusBarItem.text = '$(warning) cstack: swarm incomplete';
      statusBarItem.tooltip = 'cstack: swarm incomplete — run cstack: Reset Swarm to clear';
      statusBarItem.command = 'cstack.swarmReset';
      log('Incomplete swarm detected on startup');
    }
  }

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
  sessionManager?.stopWatching();
  disposeChannel();
}

async function handleSwarmTrigger(trigger: SwarmTrigger): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  await sessionManager.initializeSwarm(trigger, workspaceRoot);
  updateStatusBar(trigger.skill, trigger.workerCount);
}

function updateStatusBar(skill: string, n: number): void {
  statusBarItem.text = `$(rocket) cstack: ${skill}:swarm:${n}`;
  statusBarItem.tooltip = `cstack swarm active — ${n} workers`;
  statusBarItem.command = 'cstack.swarmReset';
}

function getAssetsRoot(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, 'assets');
}
