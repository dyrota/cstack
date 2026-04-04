export type SwarmSkill = 'implement' | 'test' | 'debug';
export type AllSkill = SwarmSkill | 'plan' | 'review' | 'ship' | 'checkpoint' | 'retro' | 'document';
export type TaskSource = 'plan-md' | 'inline' | 'prompted';
export type SwarmPhase = 'decompose' | 'running' | 'synthesize' | 'complete' | 'escalated' | 'failed';
export type WorkerState = 'waiting' | 'running' | 'complete' | 'failed' | 'escalated';
export type EscalationType = 'file_conflict' | 'file_scope_violation' | 'no_hypothesis_confirmed' | 'worker_empty' | 'worker_blocker';

export interface ParsedSwarmCommand {
  skill: SwarmSkill;
  swarm: true;
  workerCount: number;
  inlineDescription: string;
}

export interface ParsedSingleCommand {
  skill: AllSkill;
  swarm: false;
}

export type ParsedCommand = ParsedSwarmCommand | ParsedSingleCommand;

export interface ParseError {
  message: string;
  suggestion: string;
}

export interface WorkerResult {
  filesModified: string[];
  summary: string;
  blockers: string[];
  todos: string[];
}

export interface WorkerStatus {
  id: string;
  state: WorkerState;
  result: WorkerResult | null;
}

export interface EscalationState {
  type: EscalationType;
  message: string;
  awaitingUserResponse: boolean;
}

export interface SwarmSession {
  skill: SwarmSkill;
  n: number;
  nActual: number;
  taskDescription: string;
  taskSource: TaskSource;
  startedAt: string;
  phase: SwarmPhase;
  workers: WorkerStatus[];
  escalation: EscalationState | null;
}

export interface InstallState {
  skillsPath: string | null;
  agentsPath: string | null;
  version: string | null;
}

export interface CstackState {
  install: InstallState;
  swarm: SwarmSession | null;
}

export interface SwarmTrigger {
  skill: SwarmSkill;
  workerCount: number;
  taskSource: TaskSource;
  taskDescription: string;
  timestamp: string;
}

export interface SwarmConfig {
  models?: {
    coordinator?: string;
    workers?: string;
    scout?: string;
  };
  limits?: {
    max_workers?: number;
    summary_tokens?: number;
  };
  install?: {
    location?: 'global' | 'local';
  };
}

export interface TemplateVars {
  SKILL_NAME: string;
  WORKER_COUNT: string;
  WORKER_INDEX: string;
  WORKER_NAMES: string;
  TASK_DESCRIPTION: string;
  TASK_SOURCE: string;
  TIMESTAMP: string;
  WORKER_ROLE: string;
  FILE_SCOPE: string;
}

export interface CstackMarker {
  type: 'phase' | 'worker_start' | 'worker_done' | 'worker_failed' | 'escalation' | 'complete';
  value: string;
  payload?: Record<string, unknown>;
}
