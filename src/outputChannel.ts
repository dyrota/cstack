import * as vscode from 'vscode';
import { OUTPUT_CHANNEL_NAME } from './constants';

let channel: vscode.OutputChannel | null = null;

export function initOutputChannel(): vscode.OutputChannel {
  channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  return channel;
}

export function log(message: string): void {
  const ts = new Date().toISOString();
  channel?.appendLine(`[${ts}] ${message}`);
}

export function getChannel(): vscode.OutputChannel | null {
  return channel;
}

export function disposeChannel(): void {
  channel?.dispose();
  channel = null;
}
