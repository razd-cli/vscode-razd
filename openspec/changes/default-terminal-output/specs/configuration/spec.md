# Configuration Spec Delta

**Capability:** configuration  
**Change:** default-terminal-output

## MODIFIED Requirements

### Requirement: Default Task Output Location

The extension MUST default to executing tasks in the VS Code integrated terminal to provide full ANSI color support and interactive task execution without requiring user configuration.

**Rationale:**
- Terminal provides better user experience (ANSI colors, interactivity)
- Matches user expectations from other task runners and VS Code built-in tasks
- Output Channel limitations (no ANSI colors) reduce readability

#### Scenario: Fresh installation executes tasks in terminal by default

**Given** a fresh installation of vscode-razd extension  
**And** no user configuration for `taskfile.outputTo` exists  
**When** the user executes any task  
**Then** the task MUST run in the VS Code integrated terminal  
**And** ANSI color codes MUST be displayed correctly  
**And** the user MUST be able to interact with the running task (e.g., Ctrl+C to cancel)

#### Scenario: Explicit Output Channel configuration still works

**Given** a user has configured `"taskfile.outputTo": "output"`  
**When** the user executes any task  
**Then** the task MUST run in the Output Channel  
**And** the behavior MUST be identical to previous versions

#### Scenario: Terminal configuration settings apply to default behavior

**Given** no explicit `taskfile.outputTo` configuration (uses default)  
**And** user has configured `taskfile.terminal.per` or `taskfile.terminal.close`  
**When** the user executes tasks  
**Then** the terminal behavior MUST respect the configured terminal settings  
**And** terminal lifecycle MUST follow `terminal.per` and `terminal.close` rules

### Requirement: Configuration Schema Default Values

The extension's configuration schema in `package.json` MUST define `"terminal"` as the default value for the `taskfile.outputTo` setting.

#### Scenario: Configuration schema declares terminal as default

**Given** the extension's `package.json` configuration schema  
**When** inspecting the `taskfile.outputTo` property  
**Then** the `"default"` field MUST be set to `"terminal"`  
**And** the description MUST indicate terminal provides full ANSI color support  
**And** the enum values MUST still include both `"output"` and `"terminal"`

### Requirement: Runtime Default Fallback

The settings module MUST use `OutputTo.terminal` as the fallback value when no explicit `taskfile.outputTo` configuration is found.

#### Scenario: Settings initialization without user configuration

**Given** VS Code workspace configuration has no `taskfile.outputTo` value  
**When** the Settings class initializes or updates  
**Then** the `outputTo` property MUST be set to `OutputTo.terminal`  
**And** all task execution logic MUST use terminal output by default

## Documentation Requirements

### Requirement: Documentation Reflects Terminal as Default

The extension's README and documentation MUST clearly indicate that tasks execute in the terminal by default, with Output Channel available as an alternative.

#### Scenario: README configuration examples show current defaults

**Given** the extension's README.md file  
**When** reviewing configuration examples  
**Then** examples MUST NOT show `"taskfile.outputTo": "terminal"` (as it's redundant with default)  
**And** documentation MUST explain that Output Channel can be enabled via `"taskfile.outputTo": "output"`  
**And** terminal benefits (ANSI colors, interactivity) MUST be mentioned

## Backward Compatibility

### Requirement: Explicit Configuration Takes Precedence

User's explicit `taskfile.outputTo` configuration MUST always take precedence over default values, ensuring no breaking changes for existing users.

#### Scenario: Migrating users with explicit output configuration

**Given** a user has previously configured `"taskfile.outputTo": "output"`  
**When** the extension updates to the new default  
**Then** the user's tasks MUST continue to execute in the Output Channel  
**And** no behavior change MUST occur  
**And** no migration or prompt MUST be shown

#### Scenario: Migrating users with no explicit configuration

**Given** a user has never configured `taskfile.outputTo`  
**And** tasks previously executed in Output Channel (old default)  
**When** the extension updates to the new default  
**Then** tasks MUST now execute in the terminal  
**And** this is an **acceptable** behavior change (improves default experience)  
**And** the user CAN restore old behavior via `"taskfile.outputTo": "output"`
