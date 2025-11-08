import * as vscode from 'vscode';
import { Tool } from '../tool.js';

/**
 * A simple demonstration MCP tool that displays "Hello World" in a VS Code information alert.
 *
 * This tool serves as a proof-of-concept for the MCP tools infrastructure and demonstrates:
 * - Tool registration with VS Code's Language Model API
 * - User confirmation before execution
 * - Structured JSON response format
 * - Proper error handling
 *
 * @example
 * In GitHub Copilot Chat, invoke with:
 * "Use the razd hello world tool"
 */
export class HelloWorldTool extends Tool {
  public readonly toolName = 'razd_hello_world';
  public readonly description = 'Display a Hello World message in VS Code';

  /**
   * Execute the Hello World tool.
   *
   * Shows an information message to the user and returns a success response.
   *
   * @param options - Invocation options (no input parameters required)
   * @param token - Cancellation token
   * @returns JSON string with success status and timestamp
   */
  async call(
    options: vscode.LanguageModelToolInvocationOptions<object>,
    token: vscode.CancellationToken
  ): Promise<string> {
    // Show the Hello World message
    await vscode.window.showInformationMessage('Hello World');

    // Return structured success response
    return JSON.stringify({
      success: true,
      message: 'Hello World alert displayed',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Prepare invocation with user confirmation.
   *
   * Shows a confirmation dialog before displaying the Hello World message.
   *
   * @param options - Prepare options
   * @param token - Cancellation token
   * @returns Prepared invocation with confirmation dialog
   */
  prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<object>,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Displaying Hello World message',
      confirmationMessages: {
        title: 'Display Hello World Message',
        message: new vscode.MarkdownString(
          "Show a 'Hello World' information message?"
        )
      }
    };
  }
}
