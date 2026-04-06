import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TaskSource } from '../types';
import { PLAN_FILE } from '../constants';

export interface ResolvedTask {
  description: string;
  source: TaskSource;
  planContent?: string;
}

export async function resolveTask(
  inlineDescription: string,
  skill: string
): Promise<ResolvedTask | null> {
  // Debug swarm never uses PLAN.md
  if (skill === 'debug') {
    if (inlineDescription) {
      return { description: inlineDescription, source: 'inline' };
    }
    const prompted = await promptForDescription('Describe the bug for your debug swarm:');
    if (!prompted) return null;
    return { description: prompted, source: 'prompted' };
  }

  // Inline description always wins
  if (inlineDescription) {
    return { description: inlineDescription, source: 'inline' };
  }

  const planPath = findPlanFile();

  if (planPath) {
    const usePlan = await vscode.window.showQuickPick(
      ['Use PLAN.md as task source', 'Describe task instead'],
      {
        placeHolder: 'PLAN.md found — use it as the swarm task source?',
        ignoreFocusOut: true,
      }
    );

    if (!usePlan) return null;

    if (usePlan === 'Use PLAN.md as task source') {
      const planContent = fs.readFileSync(planPath, 'utf-8');
      return {
        description: `Execute PLAN.md`,
        source: 'plan-md',
        planContent,
      };
    }
  }

  const prompted = await promptForDescription(`Describe the task for your ${skill} swarm:`);
  if (!prompted) return null;
  return { description: prompted, source: 'prompted' };
}

function findPlanFile(): string | null {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders?.length) return null;

  const planPath = path.join(workspaceFolders[0].uri.fsPath, PLAN_FILE);
  return fs.existsSync(planPath) ? planPath : null;
}

async function promptForDescription(prompt: string): Promise<string | null> {
  const result = await vscode.window.showInputBox({
    prompt,
    placeHolder: 'Describe the task...',
    ignoreFocusOut: true,
  });
  return result ?? null;
}
