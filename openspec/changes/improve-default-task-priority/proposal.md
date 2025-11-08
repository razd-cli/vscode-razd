# Proposal: Improve Default Task Priority

**Status:** ✅ IMPLEMENTED  
**Change ID:** `improve-default-task-priority`

## Problem Statement

When opening the task picker, the `default` task is not prioritized, which creates poor UX:
- Users have to scroll to find the most important task
- No pre-selection means extra click required
- `default` task is typically the main entry point but treated equally with other tasks

## Proposed Solution

### 1. Prioritize `default` task in list
Move the `default` task to the top of the task list, regardless of alphabetical order.

### 2. Pre-select `default` task
When the task picker opens, automatically select the `default` task so users can just press Enter.

## Implementation Details

### Changes to `_loadTasksFromTaskfile()`

```typescript
private _loadTasksFromTaskfile() {
  let items: vscode.QuickPickItem[] = [];
  this._taskfiles.forEach((taskfile) => {
    if (taskfile.tasks.length > 0) {
      items = items.concat(new QuickPickTaskSeparator(taskfile));
      
      // Sort tasks: 'default' first, then rest
      const sortedTasks = [...taskfile.tasks].sort((a, b) => {
        if (a.name === 'default') return -1;
        if (b.name === 'default') return 1;
        return 0;
      });
      
      sortedTasks.forEach((task) => {
        items = items.concat(new QuickPickTaskItem(taskfile, task));
      });
    }
  });
  return items;
}
```

### Changes to `runRazd` command

```typescript
vscode.commands.registerCommand('vscode-razd.runRazd', () => {
  log.info('Command: vscode-razd.runRazd');
  let items: vscode.QuickPickItem[] = this._loadTasksFromTaskfile();

  if (items.length === 0) {
    vscode.window.showInformationMessage('No tasks found');
    return;
  }

  // Find the default task item (skip separators)
  const defaultTaskItem = items.find(
    (item) => item instanceof QuickPickTaskItem && item.label === 'default'
  );

  vscode.window
    .showQuickPick(items, {
      placeHolder: 'Select a task to run',
      // Pre-select default if found
      ...(defaultTaskItem && { activeItem: defaultTaskItem })
    })
    .then((item) => {
      if (item && item instanceof QuickPickTaskItem) {
        taskfileSvc.runTask(item.label, item.namespace.workspace);
      }
    });
})
```

## Impact

### Benefits
- ✅ Faster task execution - one less keystroke for most common case
- ✅ Better UX - important task is visually prioritized
- ✅ Consistent with convention that `default` is the main task
- ✅ No breaking changes - just reordering

### Risks
- Low risk: purely cosmetic change
- Edge case: If no `default` task exists, behavior unchanged

## Alternatives Considered

### Alternative 1: Keep alphabetical order
**Rejected:** Doesn't solve the UX problem.

### Alternative 2: Configurable sort order
**Rejected:** Over-engineering for a simple convention.

## Success Criteria

- [x] `default` task appears first in list
- [x] `default` task is pre-selected when picker opens
- [x] Other tasks maintain their order
- [x] Works with multiple workspace folders
- [x] Applied to all task picker commands consistently
- [x] Placeholder text added to all pickers
- [ ] Manual testing completed

## Implementation Summary

### Files Changed
- `src/task.ts`:
  - Updated `_loadTasksFromTaskfile()` to sort `default` first
  - Updated `runRazd` command with pre-selection
  - Updated `runTaskPicker` command with pre-selection
  - Updated `runTaskPickerWithArgs` command with pre-selection
  - Updated `goToDefinitionPicker` command with pre-selection and consolidated logic

### Key Improvements
1. **Sorting**: Tasks are now sorted with `default` first, maintaining original order for others
2. **Pre-selection**: `default` task is automatically highlighted in all pickers
3. **Placeholder text**: All pickers now have descriptive placeholder text
4. **Consistency**: All task picker commands use the same `_loadTasksFromTaskfile()` method
5. **UX**: One less keystroke to run the most common task
