export type AllSkill = 'plan' | 'implement' | 'review' | 'test' | 'ship' | 'checkpoint' | 'retro' | 'document' | 'debug';

export interface ParsedCommand {
  skill: AllSkill;
}

export interface ParseError {
  message: string;
  suggestion: string;
}

export interface InstallState {
  skillsPath: string | null;
  agentsPath: string | null;
  version: string | null;
}

export interface CstackState {
  install: InstallState;
}
