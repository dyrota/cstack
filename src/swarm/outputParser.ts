import { CstackMarker } from '../types';
import { CSTACK_MARKER_PREFIX, CSTACK_LOG_FENCE_LANG } from '../constants';

// Matches: CSTACK_PHASE: decompose
// or: CSTACK_COMPLETE: {"workers_done": 4}
const MARKER_LINE_RE = /^CSTACK_(\w+):\s*(.*)$/;

// Matches fenced code block with sentinel lang tag
const FENCED_LOG_RE = new RegExp(
  `\`\`\`${CSTACK_LOG_FENCE_LANG}([\\s\\S]*?)\`\`\``,
  'g'
);

export function parseMarkers(text: string): CstackMarker[] {
  const markers: CstackMarker[] = [];

  // Extract from fenced blocks first, then bare lines
  const sources: string[] = [];

  let fencedMatch: RegExpExecArray | null;
  while ((fencedMatch = FENCED_LOG_RE.exec(text)) !== null) {
    sources.push(fencedMatch[1]);
  }
  sources.push(text);

  for (const source of sources) {
    for (const line of source.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith(CSTACK_MARKER_PREFIX)) continue;

      const match = trimmed.match(MARKER_LINE_RE);
      if (!match) continue;

      const [, rawType, rawValue] = match;
      const type = mapMarkerType(rawType);
      if (!type) continue;

      let payload: Record<string, unknown> | undefined;
      let value = rawValue.trim();

      // Try to parse JSON payload
      if (value.startsWith('{')) {
        try {
          payload = JSON.parse(value);
          value = '';
        } catch {
          // Keep value as-is
        }
      }

      markers.push({ type, value, payload });
    }
  }

  return markers;
}

function mapMarkerType(raw: string): CstackMarker['type'] | null {
  switch (raw) {
    case 'PHASE': return 'phase';
    case 'WORKER_START': return 'worker_start';
    case 'WORKER_DONE': return 'worker_done';
    case 'WORKER_FAILED': return 'worker_failed';
    case 'ESCALATION': return 'escalation';
    case 'COMPLETE': return 'complete';
    default: return null;
  }
}

export function stripMarkers(text: string): string {
  // Remove fenced cstack-log blocks
  let result = text.replace(FENCED_LOG_RE, '');

  // Remove bare CSTACK_* lines
  result = result
    .split('\n')
    .filter((line) => !line.trim().match(/^CSTACK_\w+:/))
    .join('\n');

  return result.trim();
}
