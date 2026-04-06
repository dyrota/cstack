import * as vscode from 'vscode';
import { EscalationType, SwarmSession } from '../types';
import { StateManager } from '../state/cstackState';
import { log } from '../outputChannel';

interface EscalationContext {
  type: EscalationType;
  workerIds?: string[];
  file?: string;
  message?: string;
  payload?: Record<string, unknown>;
}

export class EscalationHandler {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async handle(context: EscalationContext): Promise<void> {
    log(`Escalation: ${context.type} — ${JSON.stringify(context)}`);

    await this.stateManager.updateSwarm({ phase: 'escalated' });

    switch (context.type) {
      case 'file_conflict':
        await this.handleFileConflict(context);
        break;
      case 'file_scope_violation':
        await this.handleScopeViolation(context);
        break;
      case 'no_hypothesis_confirmed':
        await this.handleNoHypothesis(context);
        break;
      case 'worker_empty':
        await this.handleWorkerEmpty(context);
        break;
      case 'worker_blocker':
        await this.handleWorkerBlocker(context);
        break;
    }
  }

  private async handleFileConflict(ctx: EscalationContext): Promise<void> {
    const [w1, w2] = ctx.workerIds ?? ['unknown', 'unknown'];
    const file = ctx.file ?? 'unknown file';

    const choice = await vscode.window.showWarningMessage(
      `⚠ cstack — File conflict\n\n${w1} and ${w2} both modified ${file}.\n\nChoose which version to keep:`,
      { modal: true },
      `Keep ${w1}`,
      `Keep ${w2}`,
      'Resolve manually'
    );

    if (choice) {
      log(`User resolved file conflict: ${choice}`);
    }
  }

  private async handleScopeViolation(ctx: EscalationContext): Promise<void> {
    const worker = ctx.workerIds?.[0] ?? 'unknown';
    const file = ctx.file ?? 'unknown file';

    await vscode.window.showWarningMessage(
      `⚠ cstack — Scope violation\n\n${worker} modified ${file} which was outside its assigned scope.`,
      { modal: true },
      'Understood'
    );

    log(`Scope violation from ${worker} on ${file}`);
  }

  private async handleNoHypothesis(ctx: EscalationContext): Promise<void> {
    await vscode.window.showWarningMessage(
      `⚠ cstack — No root cause confirmed\n\nNo debugger confirmed a hypothesis. Suggest running /c:debug with more context or different framing.`,
      { modal: false },
      'OK'
    );

    log('Debug swarm: no hypothesis confirmed');
  }

  private async handleWorkerEmpty(ctx: EscalationContext): Promise<void> {
    const worker = ctx.workerIds?.[0] ?? 'unknown';

    const choice = await vscode.window.showWarningMessage(
      `⚠ cstack — Worker returned no output\n\n${worker} returned no output.`,
      { modal: false },
      'Retry',
      'Skip'
    );

    log(`Worker empty: ${worker} — user chose: ${choice}`);
  }

  private async handleWorkerBlocker(ctx: EscalationContext): Promise<void> {
    const worker = ctx.workerIds?.[0] ?? 'unknown';
    const msg = ctx.message ?? 'Unknown blocker';

    const choice = await vscode.window.showWarningMessage(
      `⚠ cstack — Worker blocker\n\n${worker} reported a blocker:\n${msg}`,
      { modal: false },
      'Retry',
      'Skip'
    );

    log(`Worker blocker from ${worker}: ${msg} — user chose: ${choice}`);
  }
}
