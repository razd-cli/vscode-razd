# Change Proposal: Default Terminal Output

**ID:** `default-terminal-output`  
**Status:** Draft  
**Created:** 2025-11-08  
**Author:** AI Assistant

## Summary

Change the default output location for task execution from the Output Channel to the integrated VS Code Terminal, providing users with a more interactive and familiar task execution experience without requiring manual configuration.

## Why

Currently, tasks execute in the Output Channel by default (`outputTo: "output"`), which:
- Does not support ANSI colors (even noted in the config description)
- Provides a read-only, less interactive experience
- Is less familiar to users who expect terminal-based task execution
- Requires users to manually configure `taskfile.outputTo: "terminal"` to get terminal behavior

The integrated VS Code Terminal is the expected default for task execution because:
- It provides full ANSI color support for better readability
- Users can interact with running tasks (Ctrl+C to cancel, input if needed)
- It's the standard interface for command execution in VS Code
- Most task runners and build tools default to terminal output
- The extension already has full terminal support implemented

## Motivation

**User Experience Issue:**
Users expect tasks to run in the terminal by default, similar to:
- VS Code's built-in tasks
- npm scripts execution
- Other task runner extensions
- Command-line task execution behavior

**Current Friction:**
1. User installs extension
2. User runs a task
3. Task output appears in Output Channel (no colors, read-only)
4. User must discover and configure `taskfile.outputTo: "terminal"` setting
5. Only then do tasks execute in terminal as expected

**Proposed Experience:**
1. User installs extension
2. User runs a task
3. Task executes in terminal with full color support and interactivity
4. Works as expected immediately (zero configuration)

## Goals

1. Change default value of `taskfile.outputTo` from `"output"` to `"terminal"`
2. Maintain backward compatibility (users can still configure Output Channel if preferred)
3. Update documentation to reflect terminal as the default
4. Ensure all terminal-related settings work correctly with the new default

## What Changes

### Configuration Changes

#### 1. `package.json`
- Change default value of `taskfile.outputTo` from `"output"` to `"terminal"`
- Update description to clarify that Output Channel is available as an alternative

**Current:**
```json
"taskfile.outputTo": {
  "type": "string",
  "enum": ["output", "terminal"],
  "default": "output",
  "description": "Where to print the output of tasks. Note that the output panel does not support ANSI colors."
}
```

**Proposed:**
```json
"taskfile.outputTo": {
  "type": "string",
  "enum": ["output", "terminal"],
  "default": "terminal",
  "description": "Where to print the output of tasks. Use 'terminal' for full ANSI color support and interactivity (default), or 'output' for a read-only panel."
}
```

#### 2. `src/utils/settings.ts`
- Change default fallback value from `OutputTo.output` to `OutputTo.terminal`

**Current:**
```typescript
this.outputTo = config.get('outputTo') ?? OutputTo.output;
```

**Proposed:**
```typescript
this.outputTo = config.get('outputTo') ?? OutputTo.terminal;
```

### Documentation Changes

#### 3. `README.md`
- Update configuration examples to show terminal as default
- Add note about Output Channel as an alternative for users who prefer it
- Update screenshots/examples if they show Output Channel behavior

## Non-Goals

- This change does NOT modify terminal behavior settings (`terminal.per`, `terminal.close`)
- This change does NOT remove Output Channel support
- This change does NOT affect how tasks are executed, only where output appears

## Impact Analysis

### Breaking Changes
**None.** This is a default value change that only affects:
- New installations (no user configuration yet)
- Users who have never explicitly set `taskfile.outputTo`

Existing users with explicit configuration are unaffected.

### Compatibility
- Users who prefer Output Channel can set `"taskfile.outputTo": "output"`
- All existing functionality remains available
- No API or code changes required beyond default values

### Migration
No migration needed. Users who want to restore previous default behavior can add:
```json
{
  "taskfile.outputTo": "output"
}
```

## Success Criteria

1. New users see task output in terminal by default
2. ANSI colors display correctly in default configuration
3. Existing users with explicit `outputTo` settings see no behavior change
4. Documentation clearly explains both terminal and output channel options
5. Extension passes all existing tests

## Alternatives Considered

### Alternative 1: Keep Output Channel as Default
**Rejected because:**
- Goes against user expectations
- Requires manual configuration for standard behavior
- Output Channel limitations (no ANSI colors) reduce task output readability

### Alternative 2: Detect and Auto-Configure
Auto-detect if tasks use colors and switch to terminal automatically.

**Rejected because:**
- Adds complexity
- Inconsistent behavior is confusing
- Terminal is appropriate default for all tasks

### Alternative 3: Show Configuration Prompt on First Run
Prompt users to choose output location on first task execution.

**Rejected because:**
- Adds friction to first-run experience
- Most users would choose terminal anyway
- Configuration can always be changed later

## Related Work

- Existing terminal support implementation (already complete)
- Terminal configuration settings (`terminal.per`, `terminal.close`) work correctly
- Output Channel support remains for users who prefer it

## References

- VS Code terminal API: https://code.visualstudio.com/api/references/vscode-api#Terminal
- Related issue: User request for terminal execution by default
