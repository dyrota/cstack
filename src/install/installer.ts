import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { log } from '../outputChannel';

export type InstallLocation = 'global' | 'local';

export interface InstallPaths {
  skillsPath: string;
  agentsPath: string;
  promptsPath: string;
  instructionsPath: string;
}

export function getInstallPaths(location: InstallLocation, projectRoot?: string): InstallPaths {
  if (location === 'global') {
    const home = os.homedir();
    return {
      skillsPath: path.join(home, '.vscode', 'agents', 'skills'),
      agentsPath: path.join(home, '.github', 'agents'),
      promptsPath: path.join(home, '.github', 'prompts'),
      instructionsPath: path.join(home, '.github', 'copilot-instructions.md'),
    };
  } else {
    const root = projectRoot ?? process.cwd();
    return {
      skillsPath: path.join(root, '.agents', 'skills'),
      agentsPath: path.join(root, '.github', 'agents'),
      promptsPath: path.join(root, '.github', 'prompts'),
      instructionsPath: path.join(root, '.github', 'copilot-instructions.md'),
    };
  }
}

export function install(
  assetsRoot: string,
  location: InstallLocation,
  projectRoot?: string
): InstallPaths {
  const paths = getInstallPaths(location, projectRoot);

  installSkills(assetsRoot, paths.skillsPath);
  installAgents(assetsRoot, paths.agentsPath);
  installPrompts(assetsRoot, paths.promptsPath);
  installCopilotInstructions(assetsRoot, paths.instructionsPath);

  return paths;
}

function installSkills(assetsRoot: string, targetPath: string): void {
  const srcDir = path.join(assetsRoot, 'skills');
  if (!fs.existsSync(srcDir)) {
    log(`Skills source not found: ${srcDir}`);
    return;
  }

  fs.mkdirSync(targetPath, { recursive: true });

  const skills = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const skill of skills) {
    const skillSrc = path.join(srcDir, skill);
    const skillDst = path.join(targetPath, skill);
    fs.mkdirSync(skillDst, { recursive: true });

    const files = fs.readdirSync(skillSrc);
    for (const file of files) {
      fs.copyFileSync(path.join(skillSrc, file), path.join(skillDst, file));
    }
    log(`Installed skill: ${skill}`);
  }
}

function installAgents(assetsRoot: string, targetPath: string): void {
  const srcDir = path.join(assetsRoot, 'agents');
  if (!fs.existsSync(srcDir)) {
    log(`Agents source not found: ${srcDir}`);
    return;
  }

  fs.mkdirSync(targetPath, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.agent.md'));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(targetPath, file));
    log(`Installed agent: ${file}`);
  }
}

function installPrompts(assetsRoot: string, targetPath: string): void {
  const srcDir = path.join(assetsRoot, 'prompts');
  if (!fs.existsSync(srcDir)) return;

  fs.mkdirSync(targetPath, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.prompt.md'));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(targetPath, file));
    log(`Installed prompt: ${file}`);
  }
}

function installCopilotInstructions(assetsRoot: string, targetPath: string): void {
  const srcInstructions = path.join(assetsRoot, '..', '.github', 'copilot-instructions.md');
  if (!fs.existsSync(srcInstructions)) return;

  const block = fs.readFileSync(srcInstructions, 'utf-8');
  const marker = '<!-- cstack-instructions -->';

  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath, 'utf-8');
    if (existing.includes(marker)) {
      log('copilot-instructions.md already contains cstack block — skipping');
      return;
    }
    fs.appendFileSync(targetPath, `\n\n${marker}\n${block}\n${marker}\n`);
  } else {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, `${marker}\n${block}\n${marker}\n`);
  }

  log('Updated copilot-instructions.md');
}
