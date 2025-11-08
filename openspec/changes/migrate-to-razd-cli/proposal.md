# Change Proposal: Migrate to Razd CLI

**ID:** `migrate-to-razd-cli`  
**Status:** Draft  
**Created:** 2025-11-08  
**Author:** AI Assistant

## Summary

Migrate the extension from using `task` CLI commands to `razd` CLI commands, updating all command invocations to use `razd list --list-all --json` instead of `task --list-all --json`, and properly support the new `--taskfile` and `--version` flags.

## Why

The extension currently uses the `task` CLI under the hood. The Razd project provides a wrapper/replacement that uses `razd` as the command name. Users of Razd expect the extension to work with the `razd` command instead of (or in addition to) `task`.

Key differences in Razd CLI:
1. Command is `razd` instead of `task`
2. Uses `razd list --list-all --json` instead of `task --list-all --json`
3. Supports `--taskfile` flag to explicitly specify the taskfile path
4. Supports `--version` flag for version checking

## Motivation

Currently, the extension:
- Uses `task` as the default binary path (hardcoded in settings)
- Calls commands like `task --list-all --json`
- Has partial `--taskfile` support only for Razdfile detection

To properly support Razd CLI:
- Default binary should be `razd` (configurable)
- Commands should be `razd list --list-all --json`
- `--taskfile` flag should work consistently
- `--version` should work with Razd CLI

## Goals

1. Change default CLI binary from `task` to `razd`
2. Update command structure to use `razd list` subcommand
3. Ensure `--taskfile` flag works properly with all commands
4. Maintain backward compatibility (users can still configure `task` if needed)
5. Update documentation to reflect Razd as the primary CLI

## What Changes

### Code Changes

#### 1. `src/utils/settings.ts`
- Change default value of `path` from `"task"` to `"razd"`
- Update migration warning to mention Razd instead of Task

#### 2. `src/services/taskfile.ts`
- Update `command()` method to use `list` subcommand when calling `--list-all`
- Ensure `--taskfile` flag is properly positioned in command structure
- Update `--version` command to work with `razd --version`
- Update GitHub release checking to use `razd-cli/razd` repository

#### 3. `package.json`
- Update default value for `taskfile.path` configuration from `"task"` to `"razd"`
- Update configuration description to mention Razd

### Documentation Changes

#### 1. `README.md`
- Update installation instructions to mention Razd CLI
- Change default path documentation from `task` to `razd`
- Add note about backward compatibility with `task`

#### 2. `CHANGELOG.md`
- Add entry for migration to Razd CLI
- Note the breaking change in default configuration

### Specification Changes

#### New Capability: `cli-integration`
Defines how the extension integrates with external CLI tools (razd/task).

**Spec Delta:** `changes/migrate-to-razd-cli/specs/cli-integration/spec.md`

#### Modified Capability: `configuration`
Updates configuration defaults and descriptions.

**Spec Delta:** `changes/migrate-to-razd-cli/specs/configuration/spec.md`

## Non-Goals

- Removing support for `task` CLI entirely (users can still configure it)
- Changing the extension name or branding (already done)
- Modifying the core functionality beyond CLI command changes

## Dependencies

- Requires Razd CLI to be installed on user's system
- May depend on `add-razdfile-support` change for complete Razdfile integration

## Backward Compatibility

**Breaking Changes:**
- Default CLI binary changes from `task` to `razd`
- Users with `task` installed but not `razd` will need to update their configuration

**Migration Path:**
- Show clear error message when `razd` is not found
- Provide instructions to either install Razd or configure `taskfile.path` to use `task`
- Documentation explains how to use `task` instead of `razd`

## Testing Strategy

1. **Unit Tests:**
   - Test command construction with `razd list`
   - Test `--taskfile` flag positioning
   - Test version parsing for Razd CLI output

2. **Integration Tests:**
   - Test with real Razd CLI installation
   - Test backward compatibility with Task CLI
   - Test error handling when CLI is not found

3. **Manual Testing:**
   - Install extension with Razd CLI
   - Verify all commands work (list, run, init)
   - Test with both Taskfile.yml and Razdfile.yml

## Risks and Mitigations

**Risk:** Users without Razd CLI installed will see errors  
**Mitigation:** Clear error messages with installation instructions, easy configuration to use `task` instead

**Risk:** Command structure changes might break edge cases  
**Mitigation:** Comprehensive testing with both CLIs, gradual rollout with beta testing

**Risk:** GitHub API rate limiting when checking for updates  
**Mitigation:** Keep existing rate limiting and caching logic, update repository references only

## Success Metrics

- Extension works with Razd CLI out of the box
- No regression in functionality with Task CLI (when configured)
- Clear documentation for both CLI options
- All tests passing

## Open Questions

1. Should we support automatic detection (try `razd` first, fall back to `task`)?
2. Should we show a migration notice to existing users?
3. Should we version this as 0.5.0 or 1.0.0 given the default change?
