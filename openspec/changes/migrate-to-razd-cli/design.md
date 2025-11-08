# Design: Migrate to Razd CLI

## Overview

This design covers the migration from `task` CLI to `razd` CLI, focusing on command structure changes and maintaining backward compatibility.

## Command Structure Analysis

### Current (Task CLI)
```bash
task --list-all --json
task --version
task --init
task <task-name>
task --taskfile /path/to/file <task-name>
```

### New (Razd CLI)
```bash
razd list --list-all --json
razd --version
razd --init
razd <task-name>
razd --taskfile /path/to/file <task-name>
```

### Key Difference
The main change is adding the `list` subcommand when using `--list-all` flag.

## Implementation Approach

### 1. Command Detection Strategy

We'll use a simple approach:
- Check the configured CLI path
- If it ends with or contains `razd`, use Razd command structure
- Otherwise, use Task command structure (backward compatibility)

```typescript
private isRazdCli(): boolean {
  const cliPath = settings.path.toLowerCase();
  return cliPath.includes('razd');
}
```

### 2. Command Construction

Update the `command()` method to handle both formats:

```typescript
private command(
  command?: string,
  cliArgs?: string,
  taskfilePath?: string
): string {
  const cliPath = settings.path;
  const isRazd = this.isRazdCli();
  
  // Build taskfile option if needed
  let taskfileOption = '';
  if (taskfilePath) {
    const basename = path.basename(taskfilePath).toLowerCase();
    if (basename.startsWith('razd') || basename.includes('razdfile')) {
      taskfileOption = `--taskfile ${taskfilePath}`;
    }
  }
  
  // For list commands with Razd CLI, add 'list' subcommand
  if (command?.includes('--list-all') && isRazd) {
    command = `list ${command}`;
  }
  
  // Build final command
  // ... rest of logic
}
```

### 3. Version Checking

The version command remains the same (`razd --version` / `task --version`), but we need to update the GitHub repository check:

```typescript
async getLatestVersion(): Promise<semver.SemVer | null> {
  const isRazd = this.isRazdCli();
  const repo = isRazd 
    ? { owner: 'razd-cli', repo: 'razd' }
    : { owner: 'go-task', repo: 'task' };
    
  let response = await octokit.rest.repos.getLatestRelease(repo);
  return Promise.resolve(semver.parse(response.data.tag_name));
}
```

### 4. Settings Migration

Current setting default: `"task"`
New setting default: `"razd"`

Users who want to use Task can explicitly set:
```json
{
  "taskfile.path": "task"
}
```

### 5. Error Messages

When CLI is not found, provide helpful context:

```typescript
if (stderr !== '' || this.version === undefined) {
  const isRazd = this.isRazdCli();
  const cliName = isRazd ? 'Razd' : 'Task';
  const installUrl = isRazd 
    ? 'https://razd-cli.github.io/docs/installation/'
    : 'https://taskfile.dev/installation/';
    
  vscode.window
    .showErrorMessage(`${cliName} command not found.`, 'Install')
    .then(() => {
      vscode.env.openExternal(vscode.Uri.parse(installUrl));
    });
}
```

## Alternatives Considered

### Alternative 1: Separate Extension
Create a completely separate extension for Razd.

**Pros:** Clean separation, no compatibility concerns
**Cons:** Code duplication, split user base, maintenance overhead

**Decision:** Rejected - The CLIs are compatible enough to support both

### Alternative 2: Auto-detection
Try `razd` first, fall back to `task` if not found.

**Pros:** Seamless user experience
**Cons:** Slower startup, potential confusion about which CLI is being used

**Decision:** Deferred - Can be added later based on user feedback

### Alternative 3: Configuration Flag
Add separate `taskfile.cli` setting to choose between "razd" and "task".

**Pros:** Explicit user choice
**Cons:** Extra configuration burden, `path` setting already serves this purpose

**Decision:** Rejected - The `path` setting already allows this choice

## Testing Approach

### Unit Tests
- Test command construction with both CLIs
- Test detection logic for Razd vs Task
- Test `--taskfile` flag positioning

### Integration Tests
- Test with real Razd CLI binary
- Test with real Task CLI binary
- Test error cases (CLI not found)

### Edge Cases
- Custom CLI paths (absolute paths, PATH lookups)
- Windows vs Unix path separators
- Spaces in paths
- CLI names with version suffixes (e.g., `razd-0.5.0`)

## Migration Plan

### Phase 1: Code Changes
1. Update default setting value
2. Add CLI detection logic
3. Update command construction
4. Update version checking

### Phase 2: Documentation
1. Update README.md
2. Update CHANGELOG.md
3. Add migration guide for Task users

### Phase 3: Testing
1. Run all existing tests
2. Add new tests for Razd CLI
3. Manual testing with both CLIs

### Phase 4: Release
1. Version bump (0.5.0 or 1.0.0)
2. Release notes highlighting the change
3. Monitor for issues

## Security Considerations

- CLI path is user-configurable, validate before execution
- Avoid shell injection when constructing commands
- Use proper path escaping for `--taskfile` argument

## Performance Considerations

- CLI detection happens once per command, minimal overhead
- No additional network calls beyond existing version checking
- Command construction remains O(1)

## Compatibility Matrix

| User Has | Config | Works? | Notes |
|----------|--------|--------|-------|
| Razd CLI | Default (razd) | ✅ | Ideal case |
| Razd CLI | Set to "razd" | ✅ | Explicit |
| Razd CLI | Set to "task" | ⚠️ | Works but uses task not razd |
| Task CLI | Default (razd) | ❌ | User needs to configure |
| Task CLI | Set to "task" | ✅ | Backward compatible |
| Both installed | Default (razd) | ✅ | Uses Razd |
| Both installed | Set to "task" | ✅ | Uses Task |
| Neither installed | Any | ❌ | Error with install link |

## Rollback Plan

If issues arise:
1. Release hotfix reverting default to `"task"`
2. Keep new command structure for Razd users
3. Provide clear upgrade instructions
