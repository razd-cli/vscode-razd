# Spec: Command Processing

## MODIFIED Requirements

### REQ-CMD-001: Razd Subcommand Detection
**Priority:** High  
**Category:** Core Functionality

The system MUST correctly identify and pass through Razd native subcommands without modification.

#### Scenario: Native subcommand is passed through
**Given** the CLI path is configured as "razd"  
**And** a command starts with a Razd native subcommand (`up`, `list`, `install`, `setup`, `dev`, `build`, `run`)  
**When** the command is processed  
**Then** the subcommand and its arguments are passed through unchanged  
**And** no `run` prefix is added

**Example:**
```typescript
// Input: 'up --init'
// Output: 'razd up --init'

// Input: 'install'
// Output: 'razd install'

// Input: 'setup'
// Output: 'razd setup'
```

#### Scenario: Task name is wrapped with run
**Given** the CLI path is configured as "razd"  
**And** a command is a task name (not a native subcommand or flag)  
**When** the command is processed  
**Then** the command is prefixed with `run`

**Example:**
```typescript
// Input: 'mytask'
// Output: 'razd run mytask'

// Input: 'deploy'
// Output: 'razd run deploy'
```

#### Scenario: List command with flags
**Given** the CLI path is configured as "razd"  
**And** a command contains '--list-all'  
**When** the command is processed  
**Then** the command is prefixed with `list`

**Example:**
```typescript
// Input: '--list-all --json'
// Output: 'razd list --list-all --json'
```

#### Scenario: Flag-only commands pass through
**Given** the CLI path is configured as "razd"  
**And** a command starts with '--'  
**When** the command is processed  
**Then** the command is passed through unchanged

**Example:**
```typescript
// Input: '--version'
// Output: 'razd --version'

// Input: '--help'
// Output: 'razd --help'
```

### REQ-CMD-002: Task CLI Compatibility
**Priority:** High  
**Category:** Backward Compatibility

The system MUST maintain existing command processing behavior for Task CLI.

#### Scenario: Task CLI commands remain unchanged
**Given** the CLI path is configured as "task"  
**When** any command is processed  
**Then** the command processing follows the original Task CLI logic  
**And** no Razd-specific subcommand detection occurs

### REQ-CMD-003: Subcommand List Maintenance
**Priority:** Medium  
**Category:** Maintainability

The list of Razd native subcommands MUST be maintained in a centralized constant.

#### Scenario: Subcommands are defined in constant
**Given** the codebase  
**When** examining command processing logic  
**Then** a `RAZD_SUBCOMMANDS` constant exists  
**And** it contains all Razd native subcommands  
**And** the constant is used for subcommand detection

**Implementation:**
```typescript
const RAZD_SUBCOMMANDS = ['up', 'list', 'install', 'setup', 'dev', 'build', 'run'];
```

## ADDED Requirements

### REQ-CMD-004: Command Logging
**Priority:** Low  
**Category:** Debugging

The system SHOULD log subcommand detection decisions for debugging purposes.

#### Scenario: Detection is logged
**Given** logging is enabled  
**When** a command is processed  
**Then** the detection logic logs whether it's a native subcommand, task name, or flag  
**And** the final processed command is logged

## Related Specs

- **migrate-to-razd-cli/specs/cli-integration/spec.md** - Parent specification for Razd CLI integration
- **add-razdfile-support/specs/file-detection/spec.md** - Related to Razdfile initialization flow
