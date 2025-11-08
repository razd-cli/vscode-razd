import * as vscode from 'vscode';

/**
 * Abstract base class for all MCP (Model Context Protocol) tools.
 *
 * This class provides standardized error handling, response formatting,
 * and integration with VS Code's Language Model Tools API.
 *
 * Subclasses must implement:
 * - `toolName`: Unique identifier for the tool
 * - `description`: Brief description of the tool's purpose
 * - `call()`: Business logic that executes when the tool is invoked
 *
 * Subclasses may optionally override:
 * - `prepareInvocation()`: Provide user confirmation dialogs before execution
 */
export abstract class Tool implements vscode.LanguageModelTool<object> {
  /**
   * Unique name for this tool (must match package.json declaration)
   */
  abstract toolName: string;

  /**
   * Brief description of what this tool does
   */
  abstract description: string;

  /**
   * Main entry point for tool invocation.
   *
   * Handles error catching and response formatting automatically.
   * Delegates actual business logic to the `call()` method.
   *
   * @param options - Invocation options including input parameters
   * @param token - Cancellation token for long-running operations
   * @returns Tool result containing text response for the AI model
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<object>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      // Delegate to subclass implementation
      const response = await this.call(options, token);

      // Return successful response
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(response)
      ]);
    } catch (error) {
      // Return structured error response
      const errorPayload = {
        isError: true,
        message: error instanceof Error ? error.message : String(error)
      };

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorPayload))
      ]);
    }
  }

  /**
   * Execute the tool's business logic.
   *
   * Subclasses must implement this method with their specific functionality.
   * Should return a JSON string with the tool's response.
   *
   * @param options - Invocation options including input parameters
   * @param token - Cancellation token for long-running operations
   * @returns JSON string with tool response (e.g., {"success": true, ...})
   */
  abstract call(
    options: vscode.LanguageModelToolInvocationOptions<object>,
    token: vscode.CancellationToken
  ): Promise<string>;

  /**
   * Optional: Prepare invocation with user confirmation.
   *
   * Override this method to show confirmation dialogs or provide
   * custom invocation messages to the user before the tool executes.
   *
   * @param options - Prepare options including input parameters
   * @param token - Cancellation token
   * @returns PreparedToolInvocation with confirmation messages and invocation message
   */
  prepareInvocation?(
    options: vscode.LanguageModelToolInvocationPrepareOptions<object>,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.PreparedToolInvocation>;
}
