# Spec: Task Picker UX

## ADDED Requirements

### REQ-UX-001: Default Task Prioritization
**Priority:** High  
**Category:** User Experience

The system MUST display the `default` task as the first task in all task picker lists.

#### Scenario: Default task appears first
**Given** a Taskfile/Razdfile contains multiple tasks including `default`  
**When** the task picker is opened  
**Then** the `default` task appears at the top of the list  
**And** other tasks appear in their original order below it

**Example:**
```
Tasks:
  ✓ default          (first position)
  - hello
  - build
  - test
```

#### Scenario: No default task
**Given** a Taskfile/Razdfile does not contain a `default` task  
**When** the task picker is opened  
**Then** all tasks appear in their original order  
**And** no special sorting is applied

### REQ-UX-002: Default Task Pre-selection
**Priority:** High  
**Category:** User Experience

The system MUST pre-select the `default` task when opening the task picker.

#### Scenario: Default task is pre-selected
**Given** a Taskfile/Razdfile contains a `default` task  
**When** the task picker is opened  
**Then** the `default` task is highlighted/pre-selected  
**And** pressing Enter immediately runs the default task  
**And** user can still navigate to other tasks with arrow keys

#### Scenario: No default task available
**Given** a Taskfile/Razdfile does not contain a `default` task  
**When** the task picker is opened  
**Then** no task is pre-selected  
**And** user must manually select a task

### REQ-UX-003: Consistent Behavior Across Pickers
**Priority:** Medium  
**Category:** Consistency

All task picker commands MUST apply the same default task prioritization and pre-selection.

#### Scenario: All pickers behave consistently
**Given** multiple task picker commands exist
**When** any task picker is opened:
  - `vscode-razd.runRazd` (Play button)
  - `vscode-razd.runTaskPicker` (Command palette)
  - `vscode-razd.runTaskPickerWithArgs` (With arguments)
  - `vscode-razd.goToDefinitionPicker` (Go to definition)
**Then** all pickers show `default` task first  
**And** all pickers pre-select `default` task  
**And** all pickers have descriptive placeholder text

### REQ-UX-004: Placeholder Text
**Priority:** Low  
**Category:** User Experience

Task picker dialogs SHOULD display helpful placeholder text.

#### Scenario: Placeholder text is shown
**Given** a task picker is opened  
**When** the quick pick dialog appears  
**Then** appropriate placeholder text is displayed:
  - "Select a task to run" for run commands
  - "Select a task to run with arguments" for run with args
  - "Select a task to view its definition" for go to definition

## MODIFIED Requirements

### REQ-LIST-001: Task List Loading (Modified)
**Priority:** High  
**Category:** Core Functionality

The `_loadTasksFromTaskfile()` method MUST load and sort tasks with `default` first.

#### Scenario: Tasks are loaded and sorted
**Given** taskfiles are loaded from workspace  
**When** `_loadTasksFromTaskfile()` is called  
**Then** tasks are loaded from all taskfiles  
**And** within each taskfile, `default` task is sorted to first position  
**And** other tasks maintain their original order  
**And** separators are added between different taskfiles

## Implementation Notes

### Sorting Logic
```typescript
const sortedTasks = [...taskfile.tasks].sort((a, b) => {
  if (a.name === 'default') return -1;
  if (b.name === 'default') return 1;
  return 0;
});
```

### Pre-selection Logic
```typescript
const defaultTaskItem = items.find(
  (item) => item instanceof QuickPickTaskItem && item.label === 'default'
);

vscode.window.showQuickPick(items, {
  placeHolder: 'Select a task to run',
  ...(defaultTaskItem && { activeItem: defaultTaskItem })
});
```

## Related Specs

- **Core task execution** - REQ-EXEC-001
- **Task list display** - REQ-LIST-001
- **Quick pick integration** - VS Code API
