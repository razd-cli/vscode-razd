import * as vscode from 'vscode';
import { log } from '../../../utils/log.js';
import { Tool } from './tool.js';

/**
 * Service for managing and registering MCP (Model Context Protocol) tools.
 *
 * This service centralizes tool registration and provides a single point
 * for managing all tools in the extension.
 */
export class ToolService {
  private tools: Tool[] = [];

  /**
   * Add a tool to be registered.
   *
   * @param tool - Tool instance to register
   */
  addTool(tool: Tool): void {
    this.tools.push(tool);
  }

  /**
   * Register all added tools with VS Code's Language Model API.
   *
   * This method should be called during extension activation to make
   * tools available to AI assistants like GitHub Copilot.
   *
   * @param context - Extension context for managing subscriptions
   */
  registerTools(context: vscode.ExtensionContext): void {
    log.info(`Registering ${this.tools.length} MCP tool(s)...`);

    for (const tool of this.tools) {
      try {
        log.info(`  - Registering tool: ${tool.toolName}`);

        // Register tool with VS Code API
        const disposable = vscode.lm.registerTool(tool.toolName, tool);
        context.subscriptions.push(disposable);

        log.info(`    ✓ Tool '${tool.toolName}' registered successfully`);
      } catch (error) {
        // Log error but don't crash the extension
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(
          `    ✗ Failed to register tool '${tool.toolName}': ${errorMsg}`
        );
      }
    }

    log.info('MCP tool registration complete');
  }
}
