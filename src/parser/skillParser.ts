import { ParsedCommand, ParseError, AllSkill } from '../types';

const COMMAND_PATTERN = /^\/c:(\w[\w-]*)$/i;

const KNOWN_SKILLS = new Set<AllSkill>([
  'plan', 'implement', 'review', 'test', 'ship', 'checkpoint', 'retro', 'document', 'debug',
]);

export function parseSkillCommand(input: string): ParsedCommand | ParseError {
  const trimmed = input.trim();
  const match = trimmed.match(COMMAND_PATTERN);

  if (!match) {
    return { message: 'Not a cstack command', suggestion: 'Commands must start with /c:' };
  }

  const skill = match[1].toLowerCase() as AllSkill;

  if (!KNOWN_SKILLS.has(skill)) {
    return {
      message: `Unknown skill: ${skill}`,
      suggestion: `Known skills: ${[...KNOWN_SKILLS].join(', ')}`,
    };
  }

  return { skill };
}

export function isParseError(result: ParsedCommand | ParseError): result is ParseError {
  return 'message' in result && !('skill' in result);
}
