# Migrate to Razd CLI - Summary

## 📋 Quick Overview

**Change ID:** `migrate-to-razd-cli`  
**Type:** Breaking Change (default configuration)  
**Status:** Draft - Awaiting Approval

## 🎯 What's Changing

### Command Structure
- **Before:** `task --list-all --json`
- **After:** `razd list --list-all --json`

### Default Configuration  
- **Before:** `taskfile.path = "task"`
- **After:** `taskfile.path = "razd"`

### Version Checking
- **Before:** GitHub repo `go-task/task`
- **After:** GitHub repo `razd-cli/razd`

## 🔑 Key Points

1. **Primary Change:** Extension now uses `razd` command instead of `task` by default
2. **Backward Compatible:** Users can still use Task by setting `taskfile.path: "task"`
3. **New Features:** Proper support for `--taskfile` and `--version` flags with Razd CLI
4. **Breaking:** New users get `razd` default, existing users need to configure if using Task

## 📁 Files Created

```
openspec/changes/migrate-to-razd-cli/
├── proposal.md              # Full change proposal
├── design.md                # Technical design decisions
├── tasks.md                 # Implementation checklist
└── specs/
    ├── cli-integration/     # New capability: how extension talks to CLI
    │   └── spec.md
    └── configuration/       # Modified capability: updated defaults
        └── spec.md
```

## 🎬 Next Steps

1. **Review** this proposal for completeness
2. **Validate** using OpenSpec tooling (if available)
3. **Approve** the proposal
4. **Implement** following tasks.md checklist
5. **Test** with both Razd and Task CLIs
6. **Release** as version 0.5.0 or 1.0.0

## ⚠️ Migration Impact

### For New Users
- Install Razd CLI → works immediately
- Install Task CLI → configure `taskfile.path: "task"`

### For Existing Users (Upgrading)
- Have Razd → works with new default
- Have Task only → will see error, need to configure `taskfile.path: "task"`
- Have both → defaults to Razd, can switch to Task if preferred

## 🧪 Testing Checklist

- [ ] Unit tests for CLI detection
- [ ] Unit tests for command construction  
- [ ] Integration tests with Razd CLI
- [ ] Integration tests with Task CLI
- [ ] Manual testing all features
- [ ] Error message validation
- [ ] Documentation accuracy

## 📚 Related Changes

- **Depends on:** `add-razdfile-support` (already implemented)
- **Enables:** Full Razd ecosystem integration

## ❓ Open Questions (from Proposal)

1. Should we support automatic CLI detection (try razd, fallback to task)?
2. Should we show a migration notice to existing users?
3. Version number: 0.5.0 or 1.0.0?

---

**Created:** 2025-11-08  
**Author:** AI Assistant  
**Estimated Effort:** 10-14 hours
