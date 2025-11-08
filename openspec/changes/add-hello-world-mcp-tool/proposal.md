# Add Hello World MCP Tool

## Overview
Add a simple MCP (Language Model Tool) to the VS Code Razd extension that displays "Hello World" in a VS Code information alert when invoked by GitHub Copilot or other AI assistants.

## Why

The extension currently lacks any MCP (Model Context Protocol) tool support, limiting its ability to integrate with AI assistants like GitHub Copilot. Users who want to interact with the Razd extension through Copilot have no tools available. Adding a simple "Hello World" tool establishes the foundation for future, more complex tools while demonstrating the integration pattern.

This change addresses the need for:
1. Proof-of-concept MCP tool infrastructure
2. Base classes and patterns for future tool development
3. Clear example of tool registration and lifecycle management
4. User confirmation dialogs and feedback mechanisms

## Motivation
This change introduces the first functional MCP tool to the extension, serving as:
- A proof-of-concept for the MCP tools infrastructure
- A foundation for more complex tools in the future
- A working example demonstrating the complete MCP tool lifecycle (registration, invocation, user interaction)

## Goals
- Implement a minimal working MCP tool that integrates with VS Code's Language Model Tools API
- Display "Hello World" message using VS Code's native alert system
- Establish the base infrastructure (tool class, service, registration) for future MCP tools
- Provide clear user confirmation and feedback during tool invocation

## Non-Goals
- Complex tool parameters or configuration
- Persistent state management
- Integration with task execution or file system operations
- Performance optimization (this is a demonstration tool)

## Scope
This change adds:
1. Base `Tool` abstract class for all future MCP tools
2. `HelloWorldTool` concrete implementation
3. `ToolService` for centralized tool registration
4. Tool registration in extension activation
5. Declaration in `package.json` for VS Code MCP integration

## Dependencies
- Depends on VS Code API version 1.100.0+ (already specified in package.json)
- No external dependencies required
- Does not conflict with existing `add-mcp-tools` change (which appears to be incomplete)

## Risks & Mitigations
- **Risk**: Tool may not appear in Copilot's tool list
  - **Mitigation**: Follow exact schema from VS Code documentation and test with Copilot
- **Risk**: User might invoke tool accidentally
  - **Mitigation**: Implement `prepareInvocation` with clear confirmation dialog

## Alternatives Considered
1. **Console logging instead of alert**: Rejected because it's less visible and doesn't demonstrate proper VS Code integration
2. **Complex tool with parameters**: Rejected to keep first implementation simple and focused
3. **Integration with existing task system**: Deferred to future changes

## Success Metrics
- Tool appears in VS Code's language model tools registry
- Tool can be invoked from GitHub Copilot Chat
- "Hello World" alert displays correctly
- No errors in extension host log
- Code follows TypeScript best practices and project conventions
