<div align="center">
  <h1>Razd for Visual Studio Code</h1>

  <p>
    Visual Studio Code extension for <a href="https://github.com/razd-cli/razd"><strong>Razd</strong></a> - 
    a modern project setup tool that orchestrates <a href="https://github.com/jdx/mise">mise</a> and 
    <a href="https://taskfile.dev">taskfile</a> for one-command project initialization.
  </p>

  <p>
    This extension provides task runner functionality with support for both <code>Taskfile.yml</code> and <code>Razdfile.yml</code> formats.
  </p>

  <p>
    <a href="https://github.com/razd-cli/vscode-razd">GitHub</a> | 
    <a href="https://github.com/razd-cli/vscode-razd/issues">Issues</a> | 
    <a href="https://razd-cli.github.io/docs">Documentation</a> | 
    <a href="https://t.me/razd_cli">Telegram</a>
  </p>
</div>

## Installation

Install from [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=razd-cli.vscode-razd)

## Features

- View tasks in the sidebar.
- Run tasks from the sidebar and command palette.
- Go to definition from the sidebar and command palette.
- Run last task command.
- Multi-root workspace support.
- Initialize a Taskfile in the current workspace.
- Supports both `Taskfile.yml` and `Razdfile.yml` formats.

---

![Razd for Visual Studio Code Preview](./res/preview.png)

## Configuration

| Setting              | Type      | Allowed Values                    | Default       | Description                                                                                                                                   |
| -------------------- | --------- | --------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `updateOn`           | `string`  | `"manual"`, `"save"`              | `"save"`      | When the list of tasks should be updated.                                                                                                     |
| `path`               | `string`  |                                   | `"razd"`      | Path to the Razd/Task binary. Can be a binary name in your `$PATH` or an absolute path. Set to `"task"` to use Task CLI instead of Razd.     |
| `outputTo`           | `string`  | `"output"`, `"terminal"`          | `"terminal"`  | Where to print the output of tasks. Use `"terminal"` for full ANSI color support and interactivity, or `"output"` for a read-only panel.     |
| `checkForUpdates`    | `boolean` |                                   | `true`        | Check if there is a newer version on startup.                                                                                                 |
| `doubleClickTimeout` | `number`  |                                   | `0`         | Time in milliseconds to consider a double-click. 0 disables double-click to run. 500 is a good starting point if you want to enable it.       |
| `tree.nesting`       | `boolean` |                                   | `true`      | Whether to nest tasks by their namespace in the tree view.                                                                                    |
| `tree.status`        | `boolean` |                                   | `false`     | Whether to show the status of tasks in the tree view (may be slow on large Taskfiles/Razdfiles).                                              |
| `tree.sort`          | `sort`    | `default`, `alphanumeric`, `none` | `"default"` | The order in which to display tasks in the tree view.                                                                                         |
