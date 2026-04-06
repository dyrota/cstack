export const EXTENSION_ID = 'dyrota.cstack';
export const EXTENSION_VERSION = '1.1.0';

export const MIN_VSCODE_VERSION = '1.99.0';
export const MIN_WORKERS = 1;
export const MAX_WORKERS = 8;

export const CSTACK_DIR = '.cstack';
export const RUNTIME_DIR = '.cstack/runtime';
export const SWARM_TRIGGER_FILE = '.cstack/runtime/swarm-trigger.json';
export const SWARM_SUMMARY_FILE = '.cstack/last-swarm-summary.md';
export const SWARM_CONFIG_FILE = '.cstack/swarm.yaml';

export const PLAN_FILE = 'PLAN.md';
export const CHECKPOINT_FILE = 'CHECKPOINT.md';

export const GITIGNORE_CSTACK_BLOCK = `
# cstack runtime files
.cstack/runtime/
`;

export const SWARM_CAPABLE_SKILLS = new Set(['implement', 'test', 'debug']);

export const WORKER_ROLES: Record<string, string> = {
  implement: 'Builder',
  test: 'Tester',
  debug: 'Debugger',
};

export const SUMMARY_STALENESS_HOURS = 24;

export const OUTPUT_CHANNEL_NAME = 'cstack';

export const DEFAULT_COORDINATOR_MODEL = 'claude-sonnet-4-6';
export const DEFAULT_WORKER_MODEL = 'claude-sonnet-4-6';
export const DEFAULT_SCOUT_MODEL = 'claude-haiku-4-5';
export const DEFAULT_SUMMARY_TOKENS = 500;

export const CSTACK_MARKER_PREFIX = 'CSTACK_';
export const CSTACK_LOG_FENCE_LANG = 'cstack-log';

export const SWARM_SUMMARY_STALENESS_INSTRUCTION = `
## Swarm context
If \`.cstack/last-swarm-summary.md\` exists and is recent (< 24 hours), read it before responding. It contains the output of the most recent swarm and is relevant context for your current task.
`;

export const SWARM_CONFIG_DEFAULTS_COMMENTED = `# cstack swarm configuration
# Uncomment and change only what you need. Defaults shown.

# models:
#   coordinator: claude-sonnet-4-6
#   workers: claude-sonnet-4-6
#   scout: claude-haiku-4-5

# limits:
#   max_workers: 8
#   summary_tokens: 500

# install:
#   location: global
`;
