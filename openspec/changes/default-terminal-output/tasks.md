# Tasks: Default Terminal Output

**Change ID:** `default-terminal-output`  
**Status:** Draft

## Implementation Tasks

### 1. Configuration Changes

- [x] Update `package.json` - Change `taskfile.outputTo` default from `"output"` to `"terminal"`
  - Location: `contributes.configuration.properties.taskfile.outputTo.default`
  - Update description to emphasize terminal as default with ANSI color support
  
- [x] Update `src/utils/settings.ts` - Change fallback default value
  - Location: Line ~66, `this.outputTo` assignment
  - Change `OutputTo.output` to `OutputTo.terminal`

### 2. Documentation Updates

- [x] Update `README.md` - Reflect terminal as default output location
  - Update configuration examples section
  - Add note about Output Channel alternative
  - Update any screenshots showing Output Channel if present

### 3. Testing & Validation

- [ ] Manual test: Fresh install with no config → tasks run in terminal
- [ ] Manual test: Explicit `"outputTo": "output"` config → tasks run in Output Channel
- [ ] Manual test: No explicit config → tasks display ANSI colors correctly
- [ ] Manual test: Terminal settings (`terminal.per`, `terminal.close`) work correctly
- [ ] Verify no regression in Output Channel functionality

### 4. Final Checks

- [x] Run `openspec validate default-terminal-output --strict`
- [ ] Review all changes for consistency
- [ ] Confirm backward compatibility (explicit configs still respected)
- [ ] Update CHANGELOG.md with note about default change

## Validation Checklist

- [ ] Default behavior verified with clean installation
- [ ] ANSI colors display correctly in terminal
- [ ] Existing configurations continue to work
- [ ] Documentation accurately reflects new defaults
- [ ] No breaking changes for users with explicit settings

## Notes

- This is a simple default value change (2 lines of code)
- No new functionality added, only changing defaults
- Backward compatible - existing explicit configs unaffected
- Terminal functionality already fully implemented and working
