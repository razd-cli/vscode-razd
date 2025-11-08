import * as vscode from 'vscode';
import { log } from './utils/log.js';
import { TaskExtension } from './task.js';
import { ToolService } from './services/copilot/tools/toolService.js';
import { RazdGettingStartedTool } from './services/copilot/tools/razdGettingStartedTool/razdGettingStartedTool.js';

export function activate(context: vscode.ExtensionContext) {
  log.info('Extension activated');

  // Create a new instance of Tagger
  let taskExtension: TaskExtension = new TaskExtension();

  // Registration
  taskExtension.registerCommands(context);
  taskExtension.registerListeners(context);

  // Refresh the tasks list
  taskExtension.refresh();

  // Register MCP tools
  try {
    const toolService = new ToolService();
    toolService.addTool(new RazdGettingStartedTool());
    toolService.registerTools(context);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error(`Failed to register MCP tools: ${errorMsg}`);
  }
}

export function deactivate() {}
