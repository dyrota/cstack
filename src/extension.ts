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

import {
  parseSkillCommand,
  isParseError,
  isSwarmNotSupported,
  wasWorkerCountCapped,
} from './parser/skillParser';
import { resolveTask } from './parser/taskResolver';
import { SWARM_CAPABLE_SKILLS, SWARM_TRIGGER_FILE, EXTENSION_VERSION } from './constants';
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

  // Register @cstack chat participant (secondary entry point for swarm)
  const participant = vscode.chat.createChatParticipant(
    'dyrota.cstack',
    handleChatRequest
  );
  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'icon.png');
  context.subscriptions.push(participant);

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

async function handleChatRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<void> {
  const input = request.command
    ? `/c:${request.command} ${request.prompt}`.trim()
    : request.prompt;

  // Try to parse as a swarm command
  const parsed = parseSkillCommand(input);

  if (isParseError(parsed)) {
    stream.markdown(parsed.message);
    stream.markdown(`\n\n**Suggestion:** ${parsed.suggestion}`);
    return;
  }

  if (!parsed.swarm) {
    if (isSwarmNotSupported(input, parsed)) {
      stream.markdown(
        `Running /c:${parsed.skill} normally — swarm mode not supported for this skill.`
      );
    } else {
      stream.markdown(
        `Use /c:${parsed.skill} directly in Copilot Chat, or use @cstack /swarm ${parsed.skill}:N for parallel execution.`
      );
    }
    return;
  }

  if (wasWorkerCountCapped(parsed)) {
    stream.markdown(`Note: N capped at 8 workers.\n\n`);
  }

  // Resolve task
  const resolved = await resolveTask(parsed.inlineDescription, parsed.skill);
  if (!resolved) {
    stream.markdown('Swarm cancelled — no task provided.');
    return;
  }

  // Build and process trigger
  const trigger: SwarmTrigger = {
    skill: parsed.skill,
    workerCount: parsed.workerCount,
    taskSource: resolved.source,
    taskDescription: resolved.description,
    timestamp: new Date().toISOString(),
  };

  stream.markdown(
    `Initializing /c:${parsed.skill}:swarm:${parsed.workerCount} — generating coordinator and ${parsed.workerCount} worker agents...\n\n`
  );

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    stream.markdown('Error: No workspace folder open.');
    return;
  }

  await sessionManager.initializeSwarm(trigger, workspaceRoot);

  const role = parsed.skill === 'implement' ? 'Builder'
    : parsed.skill === 'test' ? 'Tester'
    : 'Debugger';

  stream.markdown(
    `**Swarm ready:** ${parsed.workerCount} ${role} workers initialized.\n\n` +
    `Open a new Copilot Chat session and invoke the \`@cstack-coordinator-${parsed.skill}\` agent to begin.\n\n` +
    `Task: *${resolved.description}*`
  );

  updateStatusBar(parsed.skill, parsed.workerCount);
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
