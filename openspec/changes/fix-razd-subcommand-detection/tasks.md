# Tasks: Fix Razd Subcommand Detection

## Implementation Tasks

### 1. Update command detection logic ✅ DONE
**Priority:** High  
**Estimated effort:** 30 minutes  
**Dependencies:** None

- [x] Define `RAZD_SUBCOMMANDS` constant with all native subcommands
- [x] Update command processing logic to check first word against subcommands
- [x] Add logging for subcommand detection
- [x] Ensure backward compatibility with task name execution

**Validation:**
```bash
# Should produce: razd up --init
command('up --init') 

# Should produce: razd run build
command('build')  # where 'build' is a task name, not using native subcommand

# Should produce: razd list --list-all --json
command('--list-all --json')
```

### 2. Add unit tests
**Priority:** High  
**Estimated effort:** 45 minutes  
**Dependencies:** Task 1

- [ ] Test each Razd subcommand is passed through correctly
- [ ] Test task names are wrapped with `run`
- [ ] Test `--list-all` continues to work
- [ ] Test flag-based commands (starting with `--`)
- [ ] Test Task CLI path remains unchanged

**Test cases:**
- `command('up --init')` → `razd up --init`
- `command('install')` → `razd install`
- `command('mytask')` → `razd run mytask`
- `command('--list-all --json')` → `razd list --list-all --json`
- `command('--version')` → `razd --version`

### 3. Manual testing
**Priority:** High  
**Estimated effort:** 20 minutes  
**Dependencies:** Task 1, 2

- [ ] Test Play button (Initialize Razdfile) in extension
- [ ] Test running tasks from tree view
- [ ] Test refresh/list tasks functionality
- [ ] Test with Task CLI path (ensure no regression)
- [ ] Verify error messages are clear

### 4. Update documentation
**Priority:** Medium  
**Estimated effort:** 15 minutes  
**Dependencies:** Task 1, 2, 3

- [ ] Update CHANGELOG.md with bug fix note
- [ ] Add code comments explaining subcommand detection
- [ ] Update design.md in migrate-to-razd-cli if needed

## Total Estimated Effort
**2 hours**

## Rollback Plan
If issues arise:
1. Revert the change to `command()` method
2. The `initRazd()` method already has a direct command fallback
3. No database or persistent state changes involved

## Notes
- This is a bug fix, not a new feature
- High priority as it blocks basic Razdfile initialization
- Low risk of regression due to isolated change
- Can be deployed independently
