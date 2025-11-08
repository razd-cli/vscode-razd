# Proposal: Fix Razd Subcommand Detection

**Status:** ✅ IMPLEMENTED  
**Change ID:** `fix-razd-subcommand-detection`

## Problem Statement

The `command()` method in `TaskfileService` incorrectly wraps Razd subcommands (like `up`, `install`, `setup`) with the `run` prefix, causing command execution failures.

**Current Behavior:**
- When calling `this.command('up --init')`, it produces `razd run up --init`
- This fails with: `error: unexpected argument '--init' found`

**Expected Behavior:**
- Should produce `razd up --init` directly
- Razd native subcommands should be passed through without modification

## Root Cause

The command detection logic in lines 127-138 of `taskfile.ts`:

```typescript
if (isRazd) {
  if (command.includes('--list-all')) {
    processedCommand = `list ${command}`;
  } else if (!command.startsWith('--')) {
    processedCommand = `run ${command}`;  // ❌ This catches ALL non-flag commands
  }
}
```

This logic assumes any command not starting with `--` is a task name to run, but Razd has native subcommands (`up`, `list`, `install`, `setup`, `dev`, `build`, `run`) that should not be wrapped.

## Proposed Solution

Update the command detection to recognize Razd's native subcommands:

```typescript
const RAZD_SUBCOMMANDS = ['up', 'list', 'install', 'setup', 'dev', 'build', 'run'];

if (isRazd) {
  const firstWord = command.split(/\s+/)[0];
  
  if (command.includes('--list-all')) {
    processedCommand = `list ${command}`;
  } else if (RAZD_SUBCOMMANDS.includes(firstWord)) {
    // Native Razd subcommand - pass through as-is
    processedCommand = command;
  } else if (!command.startsWith('--')) {
    // Task name - wrap with 'run'
    processedCommand = `run ${command}`;
  }
}
```

## Impact

### Benefits
- ✅ Fixes `razd up --init` execution
- ✅ Enables all Razd native subcommands to work correctly
- ✅ Maintains backward compatibility with task execution
- ✅ No breaking changes to existing functionality

### Risks
- Low risk: Only affects Razd CLI path, Task CLI unchanged
- Edge case: If user has a task literally named "up", "install", etc., it won't be wrapped with `run` (but Razd would handle this correctly anyway)

## Alternatives Considered

### Alternative 1: Special-case `init()` method
Only fix the `init()` method to bypass `command()` for init.

**Rejected:** Doesn't solve the broader problem; other Razd subcommands would still fail.

### Alternative 2: Remove command wrapping entirely
Let Razd CLI handle all command routing.

**Rejected:** Would break existing task execution that relies on implicit `run`.

### Alternative 3: Add explicit flags to `command()` method
Add a parameter like `isNativeSubcommand: boolean`.

**Rejected:** More complex API, harder to maintain. Auto-detection is cleaner.

## Validation Plan

1. **Unit Tests**
   - Test command generation for each Razd subcommand
   - Test task name wrapping with `run`
   - Test `--list-all` handling remains unchanged

2. **Integration Tests**
   - Execute `razd up --init` successfully
   - Execute `razd install` successfully
   - Execute task names correctly with `razd run <task>`
   - Verify Task CLI remains unaffected

3. **Manual Testing**
   - Test Play button (calls `initRazd()`)
   - Test task execution from tree view
   - Test task listing

## Related Changes

This proposal relates to:
- `migrate-to-razd-cli` - Extends the Razd CLI integration
- `add-razdfile-support` - Ensures Razdfile initialization works

## Success Criteria

- [ ] `razd up --init` executes without errors
- [ ] All Razd native subcommands work correctly
- [ ] Task execution continues to work with `razd run <task>`
- [ ] No regressions in Task CLI support
- [ ] Tests pass with 100% coverage of new logic
