# Specification: CLI Integration

**Capability:** `cli-integration`  
**Status:** Draft  
**Type:** New Capability

## Overview

Defines how the VS Code extension integrates with external CLI tools (Razd CLI or Task CLI), including command construction, version checking, and error handling.

## ADDED Requirements

### REQ-CLI-001: CLI Detection

The extension MUST detect which CLI tool is configured based on the `taskfile.path` setting value.

#### Scenario: Razd CLI Detected
**Given** the user has configured `taskfile.path` to `"razd"`  
**When** the extension needs to construct a command  
**Then** it MUST use Razd CLI command structure (e.g., `razd list --list-all`)

#### Scenario: Task CLI Detected
**Given** the user has configured `taskfile.path` to `"task"`  
**When** the extension needs to construct a command  
**Then** it MUST use Task CLI command structure (e.g., `task --list-all`)

#### Scenario: Custom Path with Razd
**Given** the user has configured `taskfile.path` to `"/usr/local/bin/razd"`  
**When** the extension needs to construct a command  
**Then** it MUST detect "razd" in the path and use Razd CLI structure

#### Scenario: Custom Path with Task
**Given** the user has configured `taskfile.path` to `"/snap/task/current/task"`  
**When** the extension needs to construct a command  
**Then** it MUST detect "task" in the path and use Task CLI structure

### REQ-CLI-002: List Command Structure

The extension MUST use the correct command structure for listing tasks based on the detected CLI.

#### Scenario: List Tasks with Razd CLI
**Given** Razd CLI is detected  
**When** the extension needs to list all tasks  
**Then** it MUST execute `razd list --list-all --json`

#### Scenario: List Tasks with Task CLI
**Given** Task CLI is detected  
**When** the extension needs to list all tasks  
**Then** it MUST execute `task --list-all --json`

#### Scenario: List Tasks with Taskfile Flag (Razd)
**Given** Razd CLI is detected  
**And** a specific taskfile path is provided  
**When** the extension needs to list all tasks  
**Then** it MUST execute `razd --taskfile <path> list --list-all --json`

#### Scenario: List Tasks with Additional Flags
**Given** Razd CLI is detected  
**And** nesting is enabled  
**And** status is disabled  
**When** the extension needs to list all tasks  
**Then** it MUST execute `razd list --list-all --json --nested --no-status`

### REQ-CLI-003: Version Checking

The extension MUST check for CLI version updates using the correct GitHub repository.

#### Scenario: Check Razd Version
**Given** Razd CLI is detected  
**When** the extension checks for updates  
**Then** it MUST query the `razd-cli/razd` GitHub repository

#### Scenario: Check Task Version
**Given** Task CLI is detected  
**When** the extension checks for updates  
**Then** it MUST query the `go-task/task` GitHub repository

#### Scenario: Parse Version from Razd CLI
**Given** Razd CLI is detected  
**When** executing `razd --version` returns "razd version v0.5.2"  
**Then** the extension MUST parse the version as `0.5.2`

#### Scenario: Parse Version from Task CLI
**Given** Task CLI is detected  
**When** executing `task --version` returns "Task version: v3.45.3"  
**Then** the extension MUST parse the version as `3.45.3`

### REQ-CLI-004: Error Handling

The extension MUST provide clear error messages when the CLI tool is not found or encounters errors.

#### Scenario: Razd CLI Not Found
**Given** Razd CLI is configured  
**And** `razd` command is not available in PATH  
**When** the extension tries to execute a command  
**Then** it MUST display an error message "Razd command not found."  
**And** it MUST provide a button to open installation instructions at `https://razd-cli.github.io/docs/installation/`

#### Scenario: Task CLI Not Found
**Given** Task CLI is configured  
**And** `task` command is not available in PATH  
**When** the extension tries to execute a command  
**Then** it MUST display an error message "Task command not found."  
**And** it MUST provide a button to open installation instructions at `https://taskfile.dev/installation/`

#### Scenario: CLI Version Too Old (Razd)
**Given** Razd CLI version is 0.4.0  
**And** minimum required version is 0.5.0  
**When** the extension checks the version  
**Then** it MUST display an error message indicating the required version  
**And** it MUST provide a button to open update instructions

### REQ-CLI-005: Command Execution

The extension MUST correctly construct and execute all CLI commands.

#### Scenario: Initialize Taskfile with Razd
**Given** Razd CLI is detected  
**When** the user runs the "Initialize Taskfile" command  
**Then** it MUST execute `razd --init`

#### Scenario: Run Task with Razd
**Given** Razd CLI is detected  
**When** the user runs a task named "build"  
**Then** it MUST execute `razd build`

#### Scenario: Run Task with CLI Args (Razd)
**Given** Razd CLI is detected  
**When** the user runs a task "build" with args "--verbose"  
**Then** it MUST execute `razd build -- --verbose`

#### Scenario: Run Task with Taskfile Path (Razd)
**Given** Razd CLI is detected  
**And** taskfile path is "/path/to/Razdfile.yml"  
**When** the user runs a task "build"  
**Then** it MUST execute `razd --taskfile /path/to/Razdfile.yml build`

### REQ-CLI-006: Backward Compatibility

The extension MUST maintain backward compatibility with Task CLI.

#### Scenario: Existing User with Task CLI
**Given** a user has Task CLI installed  
**And** the user upgrades the extension  
**When** the user has NOT configured `taskfile.path`  
**Then** the extension MUST use `"razd"` as the default  
**But** the user CAN set `taskfile.path` to `"task"` to continue using Task CLI

#### Scenario: Task CLI Commands Work
**Given** Task CLI is configured  
**When** executing any command  
**Then** all commands MUST work identically to the previous extension version

## Dependencies

- **Configuration Capability:** Depends on `taskfile.path` setting
- **File Detection Capability:** Integrates with Taskfile/Razdfile detection

## Testing Requirements

- Unit tests for CLI detection with various path configurations
- Unit tests for command construction with both CLIs
- Integration tests with real Razd CLI binary
- Integration tests with real Task CLI binary
- Error handling tests for both CLIs

## Implementation Notes

Detection logic should be case-insensitive and handle:
- Binary names: `razd`, `task`
- Absolute paths: `/usr/local/bin/razd`, `C:\Program Files\razd\razd.exe`
- PATH lookups: `razd.exe`, `task`
- Versioned binaries: `razd-0.5.0`, `task-3.45`
- Symlinks (should follow and detect actual binary)

## Related Specifications

- **Configuration:** Defines `taskfile.path` setting
- **File Detection:** Defines Razdfile.yml detection
