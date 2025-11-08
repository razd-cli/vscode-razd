# Tasks: Improve Default Task Priority

## Implementation Tasks

### 1. Update _loadTasksFromTaskfile() to sort tasks ✅ DONE
**Priority:** High  
**Estimated effort:** 15 minutes  
**Dependencies:** None

- [x] Add sorting logic to place `default` task first
- [x] Preserve original order for other tasks
- [x] Add comment explaining the sorting logic

### 2. Update runRazd command to pre-select default ✅ DONE
**Priority:** High  
**Estimated effort:** 20 minutes  
**Dependencies:** Task 1

- [x] Find `default` task item in the list
- [x] Pass `activeItem` option to showQuickPick
- [x] Add placeholder text for better UX
- [x] Handle case when default task doesn't exist

### 3. Test the changes 🚧 READY FOR TESTING
**Priority:** High  
**Estimated effort:** 15 minutes  
**Dependencies:** Task 1, 2

- [ ] Test with Razdfile containing `default` task
- [ ] Test with Razdfile without `default` task
- [ ] Test with multiple workspace folders
- [ ] Verify task execution works correctly
- [ ] Check that pre-selection works as expected

### 4. Update other task picker commands ✅ DONE
**Priority:** Medium  
**Estimated effort:** 10 minutes  
**Dependencies:** Task 1, 2, 3

- [x] Applied same logic to `runTaskPicker`
- [x] Applied to `runTaskPickerWithArgs`
- [x] Applied to `goToDefinitionPicker`
- [x] Ensured consistency across all pickers

## Total Estimated Effort
**1 hour**

## Validation Checklist

- [ ] `default` task is first in the list
- [ ] `default` task is pre-selected (highlighted)
- [ ] Pressing Enter immediately runs `default` task
- [ ] Other tasks still appear and work correctly
- [ ] No console errors
- [ ] Works with Task CLI and Razd CLI
