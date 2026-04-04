import { ParsedCommand, ParseError, AllSkill, SwarmSkill } from '../types';
import { SWARM_CAPABLE_SKILLS, MIN_WORKERS, MAX_WORKERS } from '../constants';

// Matches: /c:<skill>[:swarm:<N>][ <description>]
const SWARM_PATTERN = /^\/c:(\w+)(?::swarm(?::(\d+))?)?(.*)?$/i;

export function parseSkillCommand(input: string): ParsedCommand | ParseError {
  const trimmed = input.trim();
  const match = trimmed.match(SWARM_PATTERN);

  if (!match) {
    return { message: 'Not a cstack command', suggestion: 'Commands must start with /c:' };
  }

  const [, rawSkill, rawN, rawDescription] = match;
  const skill = rawSkill.toLowerCase() as AllSkill;
  const hasSwarmModifier = trimmed.includes(':swarm');
  const inlineDescription = (rawDescription ?? '').trim();

  if (!hasSwarmModifier) {
    return { skill, swarm: false };
  }

  // :swarm present but no N
  if (rawN === undefined) {
    return {
      message: `Specify number of workers: /c:${skill}:swarm:N (e.g. /c:${skill}:swarm:4)`,
      suggestion: `e.g. /c:${skill}:swarm:4`,
    };
  }

  const n = parseInt(rawN, 10);

  if (n < MIN_WORKERS) {
    return {
      message: `N must be between ${MIN_WORKERS} and ${MAX_WORKERS}`,
      suggestion: `e.g. /c:${skill}:swarm:${MIN_WORKERS}`,
    };
  }

  const workerCount = Math.min(n, MAX_WORKERS);
  const wasCapped = n > MAX_WORKERS;

  if (!SWARM_CAPABLE_SKILLS.has(skill)) {
    // Return single command — caller will show notice
    return { skill, swarm: false };
  }

  const result: ParsedCommand = {
    skill: skill as SwarmSkill,
    swarm: true,
    workerCount,
    inlineDescription,
  };

  if (wasCapped) {
    // Caller must surface the cap notice; the parsed command is still valid
    (result as ParsedCommand & { _capped: boolean })._capped = true;
  }

  return result;
}

export function isParseError(result: ParsedCommand | ParseError): result is ParseError {
  return 'message' in result && !('skill' in result);
}

export function isSwarmNotSupported(input: string, result: ParsedCommand): boolean {
  if (result.swarm) return false;
  return input.toLowerCase().includes(':swarm');
}

export function wasWorkerCountCapped(result: ParsedCommand): boolean {
  return (result as ParsedCommand & { _capped?: boolean })._capped === true;
}
