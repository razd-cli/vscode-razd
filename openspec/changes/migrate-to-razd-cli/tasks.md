# Implementation Tasks: Migrate to Razd CLI

## Prerequisites
- [x] Review current command usage in codebase
- [x] Verify Razd CLI command syntax and flags
- [x] Set up test environment with both Razd and Task CLIs

## Phase 1: Core Implementation

### Task 1: Add CLI Detection Logic
- [x] Add `isRazdCli()` method to `TaskfileService` class
- [x] Implement detection based on `settings.path` value
- [ ] Add unit tests for detection logic
- [x] Handle edge cases (absolute paths, PATH lookups)

**Files:** `src/services/taskfile.ts`  
**Tests:** Verify detection works for "razd", "task", "/usr/bin/razd", etc.

### Task 2: Update Command Construction
- [x] Modify `command()` method to add `list` subcommand when using Razd
- [x] Ensure `--taskfile` flag works with both CLIs
- [x] Update command string building logic
- [ ] Add unit tests for command construction

**Files:** `src/services/taskfile.ts`  
**Tests:** Verify `razd list --list-all --json` vs `task --list-all --json`

### Task 3: Update Version Checking
- [x] Modify `getLatestVersion()` to use correct GitHub repository
- [x] Update repository owner/name based on CLI detection
- [x] Test version parsing for both CLIs
- [ ] Add unit tests for version checking

**Files:** `src/services/taskfile.ts`  
**Tests:** Verify GitHub API calls use correct repos

### Task 4: Update Error Messages
- [x] Update "not installed" error to mention correct CLI name
- [x] Update installation URLs based on detected CLI
- [x] Update "out of date" messages
- [x] Test error message display

**Files:** `src/services/taskfile.ts`  
**Tests:** Verify correct error messages and URLs

## Phase 2: Configuration Changes

### Task 5: Update Default Settings
- [x] Change default `path` value from `"task"` to `"razd"` in `settings.ts`
- [x] Update default value in `package.json` configuration
- [x] Update configuration description in `package.json`
- [x] Test settings initialization

**Files:** `src/utils/settings.ts`, `package.json`  
**Tests:** Verify new users get `"razd"` as default

### Task 6: Update Migration Warning
- [ ] Update old config namespace warning to mention Razd
- [ ] Update warning message URLs
- [ ] Test warning display

**Files:** `src/utils/settings.ts`  
**Tests:** Verify warning shows correct information

## Phase 3: Documentation

### Task 7: Update README.md
- [x] Update installation section to mention Razd CLI
- [x] Update configuration table to show `"razd"` as default
- [x] Add note about Task CLI compatibility
- [x] Update path configuration description
- [x] Review all CLI references

**Files:** `README.md`  
**Validation:** Manual review of documentation

### Task 8: Update CHANGELOG.md
- [x] Add new version section (determine version number)
- [x] Document breaking change: default CLI changed to Razd
- [x] Document backward compatibility with Task
- [x] Note command structure changes
- [x] Add migration instructions

**Files:** `CHANGELOG.md`  
**Validation:** Manual review

## Phase 4: Testing

### Task 9: Add Unit Tests
- [ ] Test CLI detection logic
- [ ] Test command construction for Razd CLI
- [ ] Test command construction for Task CLI
- [ ] Test version checking with both repos
- [ ] Test error messages
- [ ] Test settings defaults

**Files:** `src/test/extension.test.ts` or new test file  
**Validation:** All tests pass

### Task 10: Add Integration Tests
- [ ] Test with real Razd CLI (if available)
- [ ] Test with real Task CLI (backward compat)
- [ ] Test error handling when CLI not found
- [ ] Test with Razdfile.yml
- [ ] Test with Taskfile.yml

**Files:** New integration test file  
**Validation:** Integration tests pass

### Task 11: Manual Testing
- [ ] Install Razd CLI and test all features
- [ ] Test with Task CLI configured in settings
- [ ] Test error cases (no CLI installed)
- [ ] Test in multi-root workspace
- [ ] Test all commands (list, run, init, go-to-definition)

**Validation:** Manual checklist completion

## Phase 5: Edge Cases

### Task 12: Handle Special Cases
- [ ] Test with custom absolute paths
- [ ] Test with paths containing spaces
- [ ] Test on Windows with .exe extension
- [ ] Test with CLI names including version (e.g., `razd-0.5.0`)
- [ ] Test with symlinked binaries

**Files:** `src/services/taskfile.ts`  
**Tests:** Edge case unit tests

### Task 13: Performance Testing
- [ ] Verify CLI detection doesn't slow down commands
- [ ] Check startup time impact
- [ ] Verify no extra network calls

**Validation:** Performance metrics unchanged

## Phase 6: Final Review

### Task 14: Code Review
- [ ] Review all changed files
- [ ] Check for hardcoded "task" references
- [ ] Verify backward compatibility
- [ ] Check error handling
- [ ] Review security implications

**Validation:** Code review checklist

### Task 15: Documentation Review
- [ ] Verify all docs are updated
- [ ] Check for broken links
- [ ] Verify examples work
- [ ] Review configuration descriptions

**Validation:** Documentation review checklist

### Task 16: Release Preparation
- [ ] Decide version number (0.5.0 vs 1.0.0)
- [ ] Update version in package.json
- [ ] Finalize CHANGELOG.md
- [ ] Create release notes
- [ ] Tag release

**Validation:** Release checklist complete

## Success Criteria

- ✅ Extension works with Razd CLI out of the box
- ✅ Extension works with Task CLI when configured
- ✅ All tests pass (unit + integration)
- ✅ Documentation is accurate and complete
- ✅ No breaking changes beyond default setting
- ✅ Clear migration path for existing users

## Dependencies

- Razd CLI must be available for testing
- GitHub repository `razd-cli/razd` must have releases
- Task CLI available for backward compatibility testing

## Estimated Effort

- Phase 1-2: 4-6 hours (core implementation)
- Phase 3: 1-2 hours (documentation)
- Phase 4-5: 3-4 hours (testing)
- Phase 6: 1-2 hours (review and release)

**Total:** ~10-14 hours

## Notes

- Keep backward compatibility as primary concern
- Test thoroughly with both CLIs
- Provide clear error messages
- Update all documentation references
