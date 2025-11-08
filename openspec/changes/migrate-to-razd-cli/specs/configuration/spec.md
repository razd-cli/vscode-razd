# Specification Delta: Configuration

**Capability:** `configuration`  
**Status:** Draft  
**Type:** Modified Capability

## Overview

Updates the default configuration values and descriptions to reflect the migration from Task CLI to Razd CLI.

## MODIFIED Requirements

### REQ-CONFIG-001: Default CLI Path

The extension MUST use `"razd"` as the default CLI binary path.

**Previous Requirement:**
> The extension MUST use `"task"` as the default CLI binary path.

**Rationale:** The extension now primarily supports Razd CLI, with Task CLI available via configuration.

#### Scenario: New User Default Configuration
**Given** a user installs the extension for the first time  
**When** the extension initializes  
**Then** the default value for `taskfile.path` MUST be `"razd"`

#### Scenario: User Can Override to Task
**Given** a user wants to use Task CLI instead of Razd  
**When** the user sets `taskfile.path` to `"task"` in settings  
**Then** the extension MUST use Task CLI for all operations

#### Scenario: User Can Use Custom Path
**Given** a user has Razd installed in a non-standard location  
**When** the user sets `taskfile.path` to `/usr/local/bin/razd`  
**Then** the extension MUST use that path for all CLI invocations

### REQ-CONFIG-002: CLI Path Description

The extension MUST provide accurate configuration descriptions mentioning both Razd and Task.

#### Scenario: Configuration UI Shows Razd as Primary
**Given** a user opens the extension settings  
**When** viewing the `taskfile.path` setting  
**Then** the description MUST mention Razd as the default  
**And** it MUST note that Task CLI is also supported

### REQ-CONFIG-003: Migration from Task Default

The extension MUST handle users upgrading from versions that defaulted to Task.

#### Scenario: Upgrade with No Custom Configuration
**Given** a user had the previous extension version  
**And** the user never configured `taskfile.path` (used default)  
**When** the user upgrades to this version  
**Then** the extension MUST attempt to use `"razd"` as the CLI  
**And** if Razd is not found, it MUST show a helpful error message

#### Scenario: Upgrade with Task Explicitly Configured
**Given** a user had explicitly set `taskfile.path` to `"task"`  
**When** the user upgrades to this version  
**Then** the extension MUST continue using Task CLI  
**And** no migration or warning is necessary

## ADDED Requirements

### REQ-CONFIG-004: CLI Configuration Documentation

The extension MUST provide clear documentation about CLI configuration options.

#### Scenario: README Documents Both CLIs
**Given** a user reads the README.md  
**When** looking at the configuration table  
**Then** it MUST show `"razd"` as the default for `path` setting  
**And** it MUST explain how to use Task CLI instead

#### Scenario: Error Message Explains Configuration
**Given** Razd CLI is not found  
**When** the error message is displayed  
**Then** it MUST suggest installing Razd OR configuring `taskfile.path` to use Task

## Configuration Schema

### Setting: `taskfile.path`

| Property | Value |
|----------|-------|
| Type | `string` |
| Default | `"razd"` |
| Description | Path to the Razd/Task binary. Can be a binary name in your PATH or an absolute path. Use "task" to use Task CLI instead of Razd. |
| Examples | `"razd"`, `"task"`, `"/usr/local/bin/razd"`, `"C:\\Program Files\\Razd\\razd.exe"` |

### Updated package.json Configuration

```json
{
  "configuration": {
    "title": "Razd",
    "properties": {
      "taskfile.path": {
        "type": "string",
        "default": "razd",
        "markdownDescription": "Path to the Razd/Task binary. Can be a binary name in your `$PATH` or an absolute path. Set to `task` to use Task CLI instead of Razd."
      }
    }
  }
}
```

## Dependencies

- **CLI Integration Capability:** Uses this configuration to determine CLI behavior

## Testing Requirements

- Verify default value is `"razd"` for new installations
- Verify existing explicit configuration is preserved on upgrade
- Verify custom paths work correctly
- Verify switching between `"razd"` and `"task"` works

## Migration Guide

For existing users of the extension:

1. **If you have Razd installed:** No action needed, the extension will use Razd.
2. **If you only have Task installed:** Add this to your settings:
   ```json
   {
     "taskfile.path": "task"
   }
   ```
3. **If you have both:** The extension will use Razd by default. Set `taskfile.path` to `"task"` if you prefer Task CLI.

## Related Specifications

- **CLI Integration:** Implements the detection and command construction based on this configuration
