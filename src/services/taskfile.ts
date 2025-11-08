import { Endpoints } from '@octokit/types';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { Octokit } from 'octokit';
import * as path from 'path';
import * as semver from 'semver';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { Namespace, Task } from '../models/models.js';
import {
  OutputTo,
  TerminalClose,
  TerminalPer,
  TreeSort,
  settings
} from '../utils/settings.js';
import { log } from '../utils/log.js';
import { stripVTControlCharacters } from 'node:util';

const octokit = new Octokit();
type ReleaseRequest =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['parameters'];
type ReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response'];

const minimumRequiredVersion = '3.45.3';

// General exit codes
const errCodeOK = 0;
const errCodeUnknown = 1;

// Taskfile related exit codes
const errCodeTaskfileNotFound = 100;
const errCodeTaskfileAlreadyExists = 101;
const errCodeTaskfileInvalid = 102;

// Task related exit codes
const errCodeTaskNotFound = 200;
const errCodeTaskRunError = 201;
const errCodeTaskInternal = 202;
const errCodeTaskNameConflict = 203;
const errCodeTaskCalledTooManyTimes = 204;

class TaskfileService {
  private static _instance: TaskfileService;
  private static outputChannel: vscode.OutputChannel;
  private static terminal: vscode.Terminal;
  private lastTaskName: string | undefined;
  private lastTaskDir: string | undefined;
  private lastTaskCliArgs: string | undefined;
  private version: semver.SemVer | undefined;
  private previousSelection: string | undefined;
  private previousSelectionTimestamp: number | undefined;
  private detectedTaskfilePath: string | undefined;

  private constructor() {
    TaskfileService.outputChannel = vscode.window.createOutputChannel('Task');
  }

  public static get instance() {
    return this._instance ?? (this._instance = new this());
  }

  private detectTaskfile(dir: string): string | undefined {
    const filenames = [
      'Taskfile.yml',
      'Taskfile.yaml',
      'taskfile.yml',
      'taskfile.yaml',
      'Razdfile.yml',
      'Razdfile.yaml',
      'razdfile.yml',
      'razdfile.yaml'
    ];

    for (const name of filenames) {
      const filePath = path.join(dir, name);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    return undefined;
  }

  private command(
    command?: string,
    cliArgs?: string,
    taskfilePath?: string
  ): string {
    const cliPath = settings.path;
    let taskfileOption = '';

    // If we detected a Razdfile (check both original and temp files), add --taskfile option
    if (taskfilePath) {
      const basename = path.basename(taskfilePath).toLowerCase();
      log.info(
        `command() called with taskfilePath: "${taskfilePath}", basename: "${basename}"`
      );
      // Check if it's a Razdfile or a temp file created from Razdfile
      if (basename.startsWith('razd') || basename.includes('razdfile')) {
        taskfileOption = `--taskfile ${taskfilePath}`;
        log.info(`Using --taskfile option: "${taskfileOption}"`);
      } else {
        log.info(`Not a Razdfile, using default behavior`);
      }
    }

    if (command === undefined) {
      return cliPath;
    }

    const finalCommand =
      cliArgs === undefined
        ? taskfileOption
          ? `${cliPath} ${taskfileOption} ${command}`
          : `${cliPath} ${command}`
        : taskfileOption
        ? `${cliPath} ${taskfileOption} ${command} -- ${cliArgs}`
        : `${cliPath} ${command} -- ${cliArgs}`;

    log.info(`Final command: "${finalCommand}"`);
    return finalCommand;
  }

  /**
   * Creates a temporary taskfile with version field if missing
   * @param filePath Original taskfile path
   * @returns Path to temporary file or original file if version exists
   */
  private async createTempTaskfileIfNeeded(
    filePath: string
  ): Promise<string | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(content) as any;

      // If version already exists, use original file
      if (parsed && parsed.version) {
        log.info(`File "${filePath}" already has version field`);
        return null;
      }

      // Create temporary file in the same directory as the original file
      // Use .tmp extension instead of .yml to avoid triggering FileSystemWatcher
      const dir = path.dirname(filePath);
      const originalName = path.basename(filePath, path.extname(filePath));
      const tmpFileName = `.${originalName}.tmp-${Date.now()}.tmp`;
      const tmpFilePath = path.join(dir, tmpFileName);

      // Add version at the beginning
      const withVersion = { version: '3', ...parsed };
      const yamlContent = yaml.dump(withVersion);

      fs.writeFileSync(tmpFilePath, yamlContent, 'utf8');
      log.info(`Created temporary taskfile: "${tmpFilePath}"`);

      return tmpFilePath;
    } catch (error) {
      log.error(`Failed to create temporary taskfile: ${error}`);
      return null;
    }
  }

  /**
   * Deletes temporary taskfile
   * @param filePath Path to temporary file
   */
  private deleteTempTaskfile(filePath: string | null): void {
    if (!filePath) {
      return;
    }

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log.info(`Deleted temporary taskfile: "${filePath}"`);
      }
    } catch (error) {
      log.error(`Failed to delete temporary taskfile: ${error}`);
    }
  }

  public async checkInstallation(checkForUpdates?: boolean): Promise<string> {
    if (checkForUpdates === undefined) {
      checkForUpdates = settings.checkForUpdates;
    }
    return await new Promise((resolve) => {
      let command = this.command('--version');
      // Determine the root of the working directory of the project
      let workspaceFolders = vscode.workspace.workspaceFolders;
      let cwd =
        workspaceFolders && workspaceFolders.length > 0
          ? workspaceFolders[0].uri.fsPath
          : undefined;

      cp.exec(command, { cwd }, (_, stdout: string, stderr: string) => {
        // If the version is a devel version, ignore all version checks
        if (stdout.includes('+')) {
          log.info('Using development version of task');
          this.version = new semver.SemVer('999.0.0');
          return resolve('ready');
        }

        // Get the installed version of task (if any)
        this.version = this.parseVersion(stdout);

        // If there is an error fetching the version, assume task is not installed
        if (stderr !== '' || this.version === undefined) {
          log.error(this.version ? stderr : 'Version is undefined');
          vscode.window
            .showErrorMessage('Task command not found.', 'Install')
            .then(this.buttonCallback);
          return resolve('notInstalled');
        }

        // If the current version is older than the minimum required version, show an error
        if (this.version && this.version.compare(minimumRequiredVersion) < 0) {
          log.error(
            `Task v${minimumRequiredVersion} is required to run this extension. The current version is v${this.version}`
          );
          vscode.window
            .showErrorMessage(
              `Task v${minimumRequiredVersion} is required to run this extension. The current version is v${this.version}.`,
              'Update'
            )
            .then(this.buttonCallback);
          return resolve('outOfDate');
        }

        // If a newer version is available, show a message
        // TODO: what happens if the user is offline?
        if (checkForUpdates) {
          this.getLatestVersion()
            .then((latestVersion) => {
              if (
                this.version &&
                latestVersion &&
                this.version.compare(latestVersion) < 0
              ) {
                log.info(
                  `A new version of Task is available. Current version: v${this.version}, Latest version: v${latestVersion}`
                );
                vscode.window
                  .showInformationMessage(
                    `A new version of Task is available. Current version: v${this.version}, Latest version: v${latestVersion}`,
                    'Update'
                  )
                  .then(this.buttonCallback);
              }
              return resolve('ready');
            })
            .catch((err) => {
              log.error(err);
              return resolve('notInstalled');
            });
        }

        return resolve('ready');
      });
    });
  }

  buttonCallback(value: string | undefined) {
    if (value === undefined) {
      return;
    }
    if (['Update', 'Install'].includes(value)) {
      vscode.env.openExternal(
        vscode.Uri.parse('https://taskfile.dev/installation')
      );
      return;
    }
  }

  async getLatestVersion(): Promise<semver.SemVer | null> {
    log.info(`Calling GitHub to get the latest version`);
    let request: ReleaseRequest = {
      owner: 'go-task',
      repo: 'task'
    };
    let response: ReleaseResponse = await octokit.rest.repos.getLatestRelease(
      request
    );
    return Promise.resolve(semver.parse(response.data.tag_name));
  }

  parseVersion(stdout: string): semver.SemVer | undefined {
    // Extract the version string from the output
    let matches = stdout.match(/(\d+\.\d+\.\d+)/);
    if (!matches || matches.length !== 2) {
      return undefined;
    }
    // Parse the version string as a semver
    let version = semver.parse(matches[1]);
    if (!version) {
      return undefined;
    }
    return version;
  }

  public async init(dir: string): Promise<void> {
    log.info(`Initialising taskfile in: "${dir}"`);
    return await new Promise((resolve) => {
      let command = this.command('--init');
      cp.exec(command, { cwd: dir }, (_, stdout: string, stderr: string) => {
        if (stderr) {
          vscode.window.showErrorMessage(stderr);
        }
        this.open(dir).then(() => {
          return resolve();
        });
      });
    });
  }

  public async open(dir: string): Promise<void> {
    const filePath = this.detectTaskfile(dir);
    if (filePath) {
      this.detectedTaskfilePath = filePath;
      log.info(`Opening taskfile: "${filePath}"`);
      await vscode.commands.executeCommand(
        'vscode.open',
        vscode.Uri.file(filePath),
        { preview: false }
      );
    }
  }

  public async read(
    dir: string,
    nesting: boolean,
    status: boolean
  ): Promise<Namespace | undefined> {
    log.info(`Searching for taskfile in: "${dir}"`);

    // Detect which taskfile to use
    const filePath = this.detectTaskfile(dir);
    if (!filePath) {
      return Promise.resolve(undefined);
    }

    this.detectedTaskfilePath = filePath;
    log.info(`Found taskfile: ${filePath}`);

    // Create temporary file with version if needed
    const tempFilePath = await this.createTempTaskfileIfNeeded(filePath);
    const fileToUse = tempFilePath || filePath;

    return await new Promise((resolve, reject) => {
      let flags = ['--list-all', '--json'];
      // Optional flags
      if (settings.tree.sort !== TreeSort.default) {
        flags.push(`--sort ${settings.tree.sort}`);
      }
      if (nesting) {
        flags.push(`--nested`);
      }
      if (!status) {
        flags.push(`--no-status`);
      }
      let command = this.command(`${flags.join(' ')}`, undefined, fileToUse);
      cp.exec(
        command,
        { cwd: dir },
        (err: cp.ExecException | null, stdout: string, stderr: string) => {
          // Cleanup temporary file with delay to allow for concurrent reads
          if (tempFilePath) {
            setTimeout(() => {
              this.deleteTempTaskfile(tempFilePath);
            }, 2000); // 2 second delay to allow for multiple workspace folders
          }

          if (err) {
            log.error(err);
            let shouldDisplayError = false;
            if (err.code) {
              let exitCodesToDisplayErrorsFor = [errCodeTaskfileInvalid];
              if (exitCodesToDisplayErrorsFor.includes(err.code)) {
                shouldDisplayError = true;
              }
            } else {
              if (err.message.toLowerCase().includes('failed to parse')) {
                shouldDisplayError = true;
              }
            }
            // Display an error message
            if (shouldDisplayError) {
              vscode.window.showErrorMessage(stderr);
              return reject();
            }
            return resolve(undefined);
          }
          var taskfile: Namespace = JSON.parse(stdout);

          // If we used a temporary file, replace its location with the original file path
          if (tempFilePath) {
            taskfile.location = filePath;
            // Also update location in all tasks
            taskfile.tasks?.forEach((task) => {
              if (task.location && task.location.taskfile === tempFilePath) {
                task.location.taskfile = filePath;
              }
            });
          }

          if (path.dirname(taskfile.location) !== dir) {
            log.info(
              `Ignoring taskfile: "${taskfile.location}" (outside of workspace)`
            );
            return reject();
          }
          log.info(`Found taskfile: "${taskfile.location}"`);
          taskfile.workspace = dir;
          return resolve(taskfile);
        }
      );
    });
  }

  public async runLastTask(): Promise<void> {
    if (this.lastTaskName === undefined) {
      vscode.window.showErrorMessage(`No task has been run yet.`);
      return;
    }
    await this.runTask(
      this.lastTaskName,
      this.lastTaskDir,
      this.lastTaskCliArgs
    );
  }

  public async runTask(
    taskName: string,
    dir?: string,
    cliArgs?: string
  ): Promise<void> {
    if (settings.outputTo === OutputTo.terminal) {
      log.info(`Running task: "${taskName} ${cliArgs}" in: "${dir}"`);
      if (
        TaskfileService.terminal !== undefined &&
        settings.terminal.close === TerminalClose.onNextTask
      ) {
        log.info('Closing old terminal');
        TaskfileService.terminal.dispose();
      }
      if (
        TaskfileService.terminal === undefined ||
        TaskfileService.terminal.exitStatus !== undefined ||
        settings.terminal.per === TerminalPer.task
      ) {
        log.info('Using new terminal');
        TaskfileService.terminal = vscode.window.createTerminal('Task');
      } else {
        log.info('Using existing terminal');
      }
      TaskfileService.terminal.show();
      TaskfileService.terminal.sendText(
        this.command(taskName, cliArgs, this.detectedTaskfilePath)
      );
      log.info(`Task completed on the terminal`);
      TaskfileService.outputChannel.append(`task: completed on the terminal\n`);
      this.lastTaskName = taskName;
      this.lastTaskDir = dir;
      this.lastTaskCliArgs = cliArgs;
    } else {
      return await new Promise((resolve) => {
        log.info(`Running task: "${taskName}" in: "${dir}"`);

        // Spawn a child process
        let args = [];
        if (cliArgs === undefined) {
          args = [taskName];
        } else {
          args = [taskName, '--', `${cliArgs}`];
        }

        let child = cp.spawn(
          this.command(undefined, undefined, this.detectedTaskfilePath),
          args,
          { cwd: dir }
        );

        // Open the output
        TaskfileService.outputChannel.clear();
        TaskfileService.outputChannel.show();

        // Listen for stderr
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (data) => {
          TaskfileService.outputChannel.append(
            stripVTControlCharacters(data.toString())
          );
        });

        // Listen for stdout
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (data) => {
          TaskfileService.outputChannel.append(
            stripVTControlCharacters(data.toString())
          );
        });

        // When the task finishes, print the exit code and resolve the promise
        child.on('close', (code) => {
          log.info(`Task completed with code ${code}`);
          TaskfileService.outputChannel.append(
            `task: completed with code ${code}\n`
          );
          this.lastTaskName = taskName;
          this.lastTaskDir = dir;
          this.lastTaskCliArgs = cliArgs;
          return resolve();
        });
      });
    }
  }

  public async goToDefinition(
    task: Task,
    preview: boolean = false
  ): Promise<void> {
    const currentTime = Date.now();
    const doubleClicked =
      this.previousSelection !== undefined &&
      this.previousSelectionTimestamp !== undefined &&
      this.previousSelection === task.name &&
      currentTime - this.previousSelectionTimestamp <
        settings.doubleClickTimeout;
    if (doubleClicked) {
      this.previousSelection = undefined;
      this.previousSelectionTimestamp = undefined;
      return this.runTask(task.name);
    }

    log.info(
      `Navigating to "${task.name}" definition in: "${task.location.taskfile}"`
    );

    let position = new vscode.Position(
      task.location.line - 1,
      task.location.column - 1
    );
    let range = new vscode.Range(position, position);

    // Create the vscode URI from the Taskfile path
    let file = vscode.Uri.file(task.location.taskfile);

    // Create the vscode text document show options
    let options: vscode.TextDocumentShowOptions = {
      selection: range,
      preview: preview
    };

    // Run the vscode open command with the range options
    try {
      await vscode.commands.executeCommand('vscode.open', file, options);
    } catch (err) {
      log.error(err);
    }

    this.previousSelection = task.name;
    this.previousSelectionTimestamp = currentTime;
  }
}

export const taskfileSvc = TaskfileService.instance;
