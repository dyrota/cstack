import * as path from 'path';
import * as fs from 'fs';
import { SwarmSession } from '../types';
import { SWARM_SUMMARY_FILE } from '../constants';
import { log } from '../outputChannel';

export function writeSummary(workspaceRoot: string, session: SwarmSession): void {
  const timestamp = new Date().toISOString();
  const lines: string[] = [
    '# cstack Swarm Summary',
    '',
    `**Skill:** /c:${session.skill}:swarm:${session.n}`,
    `**Task:** ${session.taskDescription}`,
    `**Completed:** ${timestamp}`,
    `**Workers used:** ${session.nActual} of ${session.n}`,
    '',
    '## Worker Results',
    '',
  ];

  for (const worker of session.workers) {
    const result = worker.result;
    if (!result) {
      lines.push(`### ${worker.id} — no output`);
      lines.push(`State: ${worker.state}`);
      lines.push('');
      continue;
    }

    const files = result.filesModified.length > 0 ? result.filesModified.join(', ') : 'none';
    lines.push(`### ${worker.id} — ${files}`);
    lines.push(result.summary || '(no summary)');

    if (result.todos.length > 0) {
      lines.push(`TODOs: ${result.todos.join('; ')}.`);
    } else {
      lines.push('TODOs: None.');
    }

    if (result.blockers.length > 0) {
      lines.push(`Blockers: ${result.blockers.join('; ')}.`);
    } else {
      lines.push('Blockers: None.');
    }

    lines.push('');
  }

  // All files modified
  const allFiles = session.workers
    .flatMap((w) => w.result?.filesModified ?? [])
    .filter((v, i, arr) => arr.indexOf(v) === i);

  lines.push('## All Files Modified');
  lines.push(allFiles.length > 0 ? allFiles.join(', ') : 'None.');
  lines.push('');

  // Escalations
  lines.push('## Escalations');
  if (session.escalation) {
    lines.push(session.escalation.message);
  } else {
    lines.push('None.');
  }
  lines.push('');

  // Suggested next step
  const nextStep = getNextStep(session.skill);
  lines.push('## Suggested next step');
  lines.push(nextStep);

  const summaryPath = path.join(workspaceRoot, SWARM_SUMMARY_FILE);
  try {
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.writeFileSync(summaryPath, lines.join('\n'), 'utf-8');
    log(`Wrote swarm summary to ${SWARM_SUMMARY_FILE}`);
  } catch (err) {
    log(`Failed to write swarm summary: ${err}`);
  }
}

function getNextStep(skill: string): string {
  switch (skill) {
    case 'implement': return '/c:review';
    case 'test': return '/c:ship';
    case 'debug': return '/c:implement (apply the confirmed fix)';
    default: return '/c:review';
  }
}
