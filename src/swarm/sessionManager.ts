import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SwarmSession, SwarmTrigger, SwarmSkill, WorkerStatus } from '../types';
import { StateManager } from '../state/cstackState';
import { generateCoordinatorContent, generateWorkerContent } from './templateEngine';
import { RUNTIME_DIR, SWARM_TRIGGER_FILE, WORKER_ROLES, MAX_WORKERS } from '../constants';
import { log } from '../outputChannel';

export class SessionManager {
  private stateManager: StateManager;
  private triggerWatcher: vscode.FileSystemWatcher | null = null;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  startWatching(workspaceRoot: string): void {
    const triggerPattern = new vscode.RelativePattern(workspaceRoot, SWARM_TRIGGER_FILE);
    this.triggerWatcher = vscode.workspace.createFileSystemWatcher(triggerPattern);

    this.triggerWatcher.onDidCreate((uri) => this.handleTriggerFile(uri));
    this.triggerWatcher.onDidChange((uri) => this.handleTriggerFile(uri));

    log(`Watching for swarm trigger at ${SWARM_TRIGGER_FILE}`);
  }

  stopWatching(): void {
    this.triggerWatcher?.dispose();
    this.triggerWatcher = null;
  }

  private async handleTriggerFile(uri: vscode.Uri): Promise<void> {
    try {
      const raw = fs.readFileSync(uri.fsPath, 'utf-8');
      const trigger: SwarmTrigger = JSON.parse(raw);
      log(`Swarm trigger detected: ${JSON.stringify(trigger)}`);

      // Delete trigger file to prevent re-processing
      fs.unlinkSync(uri.fsPath);

      await this.initializeSwarm(trigger, path.dirname(path.dirname(uri.fsPath)));
    } catch (err) {
      log(`Error processing swarm trigger: ${err}`);
      vscode.window.showErrorMessage(`cstack: Failed to process swarm trigger — ${err}`);
    }
  }

  async initializeSwarm(trigger: SwarmTrigger, workspaceRoot: string): Promise<void> {
    const { skill, workerCount, taskDescription, taskSource, timestamp } = trigger;
    const nActual = Math.min(workerCount, MAX_WORKERS);
    const runtimeDir = path.join(workspaceRoot, RUNTIME_DIR);
    const agentsDir = path.join(workspaceRoot, '.github', 'agents');

    // Ensure runtime and agents dirs exist
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.mkdirSync(agentsDir, { recursive: true });

    log(`Initializing swarm: ${skill}:swarm:${nActual}`);

    // Generate coordinator
    const coordinatorContent = generateCoordinatorContent(
      skill as SwarmSkill,
      nActual,
      taskDescription,
      taskSource,
      timestamp
    );
    const coordinatorFile = path.join(runtimeDir, `coordinator.agent.md`);
    fs.writeFileSync(coordinatorFile, coordinatorContent, 'utf-8');

    // Also copy to agents dir so Copilot Chat discovers it
    fs.writeFileSync(
      path.join(agentsDir, `cstack-coordinator-${skill}.agent.md`),
      coordinatorContent,
      'utf-8'
    );

    // Generate workers
    const workerPaths: string[] = [];
    for (let i = 1; i <= nActual; i++) {
      const workerContent = generateWorkerContent(
        skill as SwarmSkill,
        i,
        nActual,
        taskDescription,
        '',
        timestamp
      );
      const role = WORKER_ROLES[skill] ?? skill;
      const workerFile = path.join(runtimeDir, `worker-${i}.agent.md`);
      fs.writeFileSync(workerFile, workerContent, 'utf-8');

      const agentFile = path.join(agentsDir, `cstack-${role.toLowerCase()}-${i}.agent.md`);
      fs.writeFileSync(agentFile, workerContent, 'utf-8');
      workerPaths.push(agentFile);
    }

    // Build session state
    const workers: WorkerStatus[] = Array.from({ length: nActual }, (_, i) => ({
      id: `${WORKER_ROLES[skill]?.toLowerCase() ?? skill}-${i + 1}`,
      state: 'waiting',
      result: null,
    }));

    const session: SwarmSession = {
      skill: skill as SwarmSkill,
      n: workerCount,
      nActual,
      taskDescription,
      taskSource,
      startedAt: timestamp,
      phase: 'decompose',
      workers,
      escalation: null,
    };

    await this.stateManager.setSwarm(session);

    const role = WORKER_ROLES[skill] ?? skill;
    const message = `cstack: Swarm ready — ${nActual} ${role} workers initialized. Open Copilot Chat and invoke @cstack-coordinator-${skill} to start.`;
    log(message);

    vscode.window
      .showInformationMessage(message, 'Open Chat')
      .then((action) => {
        if (action === 'Open Chat') {
          vscode.commands.executeCommand('workbench.action.chat.open');
        }
      });
  }

  async resetSwarm(workspaceRoot: string): Promise<void> {
    // Clear runtime files
    const runtimeDir = path.join(workspaceRoot, RUNTIME_DIR);
    if (fs.existsSync(runtimeDir)) {
      const files = fs.readdirSync(runtimeDir);
      for (const file of files) {
        fs.unlinkSync(path.join(runtimeDir, file));
      }
      log('Cleared .cstack/runtime/');
    }

    // Remove generated agent files from .github/agents/
    const agentsDir = path.join(workspaceRoot, '.github', 'agents');
    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir).filter((f) => f.startsWith('cstack-'));
      for (const file of files) {
        fs.unlinkSync(path.join(agentsDir, file));
      }
      log(`Removed ${files.length} generated cstack agent files`);
    }

    await this.stateManager.clearSwarm();
    log('Swarm session cleared');
  }

  checkForStaleTrigger(workspaceRoot: string): boolean {
    const triggerPath = path.join(workspaceRoot, SWARM_TRIGGER_FILE);
    return fs.existsSync(triggerPath);
  }
}
