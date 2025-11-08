# Hello World MCP Tool

**Capability ID**: `hello-world-tool`  
**Related Change**: `add-hello-world-mcp-tool`

## Overview
This specification defines a minimal MCP (Model Context Protocol) tool that displays a "Hello World" message in VS Code. This tool serves as a proof-of-concept for the MCP tools infrastructure and demonstrates the complete lifecycle of tool registration, invocation, and user interaction.

---

## ADDED Requirements

### Requirement: Tool Registration Infrastructure
The extension MUST provide base infrastructure for registering and managing MCP tools.

**Rationale**: Establishes reusable patterns for all future MCP tools in the extension.

#### Scenario: Base Tool Class Provides Standard Interface
**Given** the extension needs to implement multiple MCP tools  
**When** a developer creates a new tool  
**Then** they can extend the abstract `Tool` class  
**And** implement only the `call()` method for business logic  
**And** optionally override `prepareInvocation()` for user confirmations  
**And** inherit standardized error handling and response formatting

#### Scenario: Tool Service Manages Registration
**Given** multiple tools need to be registered with VS Code  
**When** the extension activates  
**Then** the `ToolService` class registers all tools via `vscode.lm.registerTool()`  
**And** logs registration status for each tool  
**And** handles registration errors gracefully without crashing the extension

---

### Requirement: Hello World Tool Declaration
The extension MUST declare the Hello World tool in package.json with proper schema and metadata.

**Rationale**: VS Code requires tools to be declared before they can be discovered by AI assistants.

#### Scenario: Tool Declaration in Package Manifest
**Given** the extension's package.json  
**When** the manifest is loaded by VS Code  
**Then** the tool is declared in `contributes.languageModelTools`  
**And** has a unique name "razd_hello_world"  
**And** includes a clear `modelDescription` explaining when to use the tool  
**And** defines an `inputSchema` with no required parameters  
**And** uses appropriate tags like ["demo", "greeting", "razd"] for discoverability  
**And** has an icon (e.g., "$(comment-discussion)") and display name

#### Scenario: Tool Discovery by AI Assistant
**Given** GitHub Copilot or another AI assistant is active  
**When** the user mentions "razd hello world" or "greeting tool"  
**Then** the AI can discover the tool via tags and description  
**And** the tool appears in the available tools list  
**And** the AI understands from `modelDescription` that this is a demonstration tool

---

### Requirement: Hello World Tool Execution
The tool MUST display "Hello World" message when invoked and return structured success response.

**Rationale**: Provides clear user feedback and demonstrates proper VS Code integration.

#### Scenario: Successful Tool Invocation
**Given** the Hello World tool is registered and available  
**When** an AI assistant invokes the tool with no parameters  
**Then** VS Code shows an information alert with message "Hello World"  
**And** the tool returns a JSON response: `{"success": true, "message": "Hello World alert displayed", "timestamp": "<ISO date>"}`  
**And** no errors are logged to the extension host console

#### Scenario: User Confirmation Before Execution
**Given** an AI assistant attempts to invoke the Hello World tool  
**When** the `prepareInvocation()` method is called  
**Then** VS Code displays a confirmation dialog  
**And** the dialog title is "Display Hello World Message"  
**And** the dialog message asks "Show a 'Hello World' information message?"  
**And** the invocation message shown to user is "Displaying Hello World message"  
**And** the tool only executes if the user confirms

#### Scenario: Tool Execution Error Handling
**Given** the Hello World tool encounters an unexpected error  
**When** the `call()` method throws an exception  
**Then** the base `Tool.invoke()` method catches the error  
**And** returns a structured error response: `{"isError": true, "message": "<error details>"}`  
**And** the error is logged but does not crash the extension  
**And** the AI assistant receives the error response for context

---

### Requirement: Extension Integration
The Hello World tool MUST integrate seamlessly with the extension's activation lifecycle.

**Rationale**: Ensures tools are available when needed and properly cleaned up.

#### Scenario: Tool Registration on Extension Activation
**Given** the VS Code extension activates  
**When** the `activate()` function runs  
**Then** the `ToolService` is instantiated  
**And** `registerTools()` is called with the extension context  
**And** the Hello World tool is registered via `context.subscriptions.push()`  
**And** a log message confirms successful registration  
**And** the tool is immediately available to AI assistants

#### Scenario: Graceful Handling of Registration Failure
**Given** tool registration is attempted  
**When** registration fails (e.g., VS Code version incompatibility)  
**Then** an error is logged with details  
**And** the extension continues to activate other features  
**And** other functionality (task tree, commands) remains operational  
**And** the user is not shown intrusive error dialogs

---

## Implementation Notes

### File Structure
```
src/services/copilot/tools/
├── tool.ts                       # Abstract base class
├── toolService.ts                # Registration service
├── helloWorldTool/
│   └── helloWorldTool.ts        # Concrete implementation
└── index.ts                      # Module exports
```

### Type Definitions
```typescript
// Base tool interface (aligned with VS Code API)
abstract class Tool implements vscode.LanguageModelTool<object> {
    abstract toolName: string;
    abstract description: string;
    
    invoke(options, token): Promise<vscode.LanguageModelToolResult>;
    abstract call(options, token): Promise<string>;
    prepareInvocation?(options, token): Promise<vscode.LanguageModelToolInvocationPrepareOptions>;
}
```

### Response Format
All tools return JSON strings with consistent structure:
- Success: `{"success": true, "message": "...", ...}`
- Error: `{"isError": true, "message": "..."}`

### VS Code API Requirements
- Minimum version: 1.100.0 (already met)
- Required API: `vscode.lm.registerTool()`
- Required types: `vscode.LanguageModelTool`, `vscode.LanguageModelToolResult`

---

## Testing Considerations

### Manual Testing
1. Load extension in development host
2. Open GitHub Copilot Chat
3. Type: "Use the razd hello world tool"
4. Verify confirmation dialog appears
5. Click "OK" in confirmation
6. Verify "Hello World" alert displays
7. Check extension host log for errors

### Validation Points
- Tool appears in `vscode.lm` registry
- No TypeScript compilation errors
- No runtime errors in extension host
- User sees confirmation before execution
- Alert displays with correct message
- JSON response structure is valid

---

## Future Enhancements
This spec is intentionally minimal. Future changes may:
- Add tools with parameters (task execution, file operations)
- Implement tool chaining and workflows
- Add telemetry for tool usage analytics
- Create tool testing framework
- Add tool documentation generation
