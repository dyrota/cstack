import * as path from 'path';
import * as fs from 'fs';
import { TemplateVars, SwarmSkill } from '../types';
import {
  WORKER_ROLES,
  DEFAULT_COORDINATOR_MODEL,
  DEFAULT_WORKER_MODEL,
  DEFAULT_SUMMARY_TOKENS,
} from '../constants';

// Template files are bundled as text via esbuild --loader:.tmpl=text
// Using require() for compatibility with the CJS bundle output
function loadTemplate(filename: string): string {
  const templateDir = path.join(__dirname, '..', '..', 'assets', 'templates');
  return fs.readFileSync(path.join(templateDir, filename), 'utf-8');
}

function applyTemplate(template: string, vars: Partial<TemplateVars>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    return (vars as Record<string, string>)[key] ?? `{{${key}}}`;
  });
}

function removeConditionalBlocks(template: string, skill: SwarmSkill): string {
  const activeBlock = `if_${skill}`;
  // Remove non-matching conditional blocks entirely
  let result = template.replace(
    /\{\{#if_(\w+)\}\}([\s\S]*?)\{\{\/if_\w+\}\}/g,
    (_, blockSkill, content) => {
      return blockSkill === activeBlock.replace('if_', '') ? content : '';
    }
  );
  // Handle plan_md conditional based on task source (simple: always show plain task)
  result = result.replace(/\{\{#if_plan_md\}\}[\s\S]*?\{\{else\}\}([\s\S]*?)\{\{\/if_plan_md\}\}/g, '$1');
  return result;
}

export interface GeneratedAgentFiles {
  coordinatorPath: string;
  workerPaths: string[];
}

export function generateCoordinatorContent(
  skill: SwarmSkill,
  workerCount: number,
  taskDescription: string,
  taskSource: string,
  timestamp: string
): string {
  const template = loadTemplate('coordinator.agent.md.tmpl');
  const role = WORKER_ROLES[skill] ?? skill;
  const workerNames = Array.from({ length: workerCount }, (_, i) =>
    `'cstack-${role.toLowerCase()}-${i + 1}'`
  ).join(', ');

  const vars: Partial<TemplateVars> = {
    SKILL_NAME: skill,
    WORKER_COUNT: String(workerCount),
    WORKER_NAMES: workerNames,
    TASK_DESCRIPTION: taskDescription,
    TASK_SOURCE: taskSource,
    TIMESTAMP: timestamp,
    WORKER_ROLE: role,
    SUMMARY_TOKENS: String(DEFAULT_SUMMARY_TOKENS),
  } as unknown as Partial<TemplateVars>;

  const withConditionals = removeConditionalBlocks(template, skill);
  return applyTemplate(withConditionals, vars);
}

export function generateWorkerContent(
  skill: SwarmSkill,
  workerIndex: number,
  workerCount: number,
  taskDescription: string,
  fileScope: string,
  timestamp: string
): string {
  const template = loadTemplate('worker.agent.md.tmpl');
  const role = WORKER_ROLES[skill] ?? skill;

  const toolsBySkill: Record<SwarmSkill, string> = {
    implement: "['search/codebase', 'search/usages', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/changes', 'edit', 'execute', 'read']",
    test: "['search/codebase', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'execute', 'edit', 'read']",
    debug: "['search/codebase', 'search/usages', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/changes', 'execute', 'read']",
  };

  const vars = {
    SKILL_NAME: skill,
    WORKER_INDEX: String(workerIndex),
    WORKER_COUNT: String(workerCount),
    WORKER_ROLE: role,
    WORKER_ROLE_LOWER: role.toLowerCase(),
    WORKER_TOOLS: toolsBySkill[skill],
    TASK_DESCRIPTION: taskDescription,
    FILE_SCOPE: fileScope || 'As assigned by coordinator',
    TIMESTAMP: timestamp,
    SUMMARY_TOKENS: String(DEFAULT_SUMMARY_TOKENS),
  };

  const withConditionals = removeConditionalBlocks(template, skill);
  return applyTemplate(withConditionals, vars as unknown as Partial<TemplateVars>);
}
