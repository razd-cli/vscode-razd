# Implementation Tasks

## Phase 1: Infrastructure Setup
- [x] Create base `Tool` abstract class at `src/services/copilot/tools/tool.ts`
  - Implement `invoke()` method with error handling
  - Define abstract `call()` method for business logic
  - Define optional `prepareInvocation()` method for confirmations
  - Add proper JSDoc comments

- [x] Create `ToolService` class at `src/services/copilot/tools/toolService.ts`
  - Implement `registerTools()` method
  - Support tool registration with VS Code API
  - Add logging for debugging

## Phase 2: Hello World Tool Implementation
- [x] Create `HelloWorldTool` class at `src/services/copilot/tools/helloWorldTool/helloWorldTool.ts`
  - Extend base `Tool` class
  - Implement `call()` to show VS Code information message
  - Implement `prepareInvocation()` for user confirmation
  - Return success JSON response

- [x] Add tool declaration to `package.json`
  - Add `contributes.languageModelTools` section if missing
  - Define tool schema with proper modelDescription
  - Add appropriate tags for discoverability
  - Set icon and display name

## Phase 3: Integration
- [x] Update `src/extension.ts` to register tools
  - Import `ToolService`
  - Instantiate service in `activate()`
  - Call `registerTools()` with extension context
  - Add error handling for registration failures

- [x] Add exports to maintain clean module structure
  - Create `src/services/copilot/tools/index.ts` if needed
  - Export Tool base class and ToolService

## Phase 4: Validation & Testing
- [x] Run `openspec validate add-hello-world-mcp-tool --strict`
  - Fix any validation errors
  - Ensure all requirements have scenarios

- [ ] Manual testing
  - Reload VS Code extension development host
  - Verify no errors in extension host log
  - Open GitHub Copilot Chat
  - Invoke tool with prompt: "Use razd hello world tool"
  - Confirm alert displays "Hello World"

- [x] Code quality checks
  - Run TypeScript compiler: `npm run compile`
  - Fix any TypeScript errors
  - Verify code follows project conventions
  - Check that all files are properly formatted

## Phase 5: Documentation
- [x] Add inline code comments
  - Document complex logic
  - Add JSDoc for public methods
  - Include usage examples in comments

- [x] Update CHANGELOG.md if exists
  - Add entry for new MCP tool feature
  - Note that this is the first MCP tool implementation

## Dependencies & Sequencing
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 3 must complete before Phase 4
- Phase 4 validation can run in parallel with manual testing
- Phase 5 can be done incrementally throughout

## Rollback Plan
If issues arise:
1. Remove tool declaration from `package.json`
2. Remove `ToolService.registerTools()` call from `extension.ts`
3. Tool infrastructure (classes) can remain for future use
