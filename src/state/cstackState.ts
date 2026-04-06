import * as vscode from 'vscode';
import { CstackState, SwarmSession, InstallState } from '../types';
import { EXTENSION_VERSION } from '../constants';

const STATE_KEY = 'cstackState';

const DEFAULT_STATE: CstackState = {
  install: {
    skillsPath: null,
    agentsPath: null,
    version: null,
  },
  swarm: null,
};

export class StateManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  get(): CstackState {
    return this.context.workspaceState.get<CstackState>(STATE_KEY) ?? { ...DEFAULT_STATE };
  }

  private async set(state: CstackState): Promise<void> {
    await this.context.workspaceState.update(STATE_KEY, state);
  }

  async updateInstall(install: Partial<InstallState>): Promise<void> {
    const state = this.get();
    await this.set({
      ...state,
      install: { ...state.install, ...install, version: EXTENSION_VERSION },
    });
  }

  async setSwarm(swarm: SwarmSession | null): Promise<void> {
    const state = this.get();
    await this.set({ ...state, swarm });
  }

  async updateSwarm(updates: Partial<SwarmSession>): Promise<void> {
    const state = this.get();
    if (!state.swarm) return;
    await this.set({ ...state, swarm: { ...state.swarm, ...updates } });
  }

  async clearSwarm(): Promise<void> {
    await this.setSwarm(null);
  }

  hasIncompleteSwarm(): boolean {
    const state = this.get();
    if (!state.swarm) return false;
    return !['complete', 'failed'].includes(state.swarm.phase);
  }
}
