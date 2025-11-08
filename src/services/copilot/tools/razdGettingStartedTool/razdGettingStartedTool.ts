import * as vscode from 'vscode';
import { Tool } from '../tool.js';

/**
 * MCP tool that provides comprehensive guidance for working with Razd and creating Razdfile.yml.
 *
 * This tool helps users:
 * - Understand Razd project structure
 * - Create properly formatted Razdfile.yml
 * - Configure mise tools
 * - Learn essential Razd commands
 *
 * @example
 * In GitHub Copilot Chat, invoke with:
 * "Help me set up Razd" or "Show Razd getting started guide"
 */
export class RazdGettingStartedTool extends Tool {
  public readonly toolName = 'razd_getting_started';
  public readonly description =
    'Provide getting started guide and help for Razd project setup';

  /**
   * Execute the Razd Getting Started tool.
   *
   * Provides comprehensive information about Razd setup, including:
   * - Razdfile.yml template
   * - mise tools configuration
   * - Common commands and usage
   *
   * @param options - Invocation options (no input parameters required)
   * @param token - Cancellation token
   * @returns JSON string with Razd setup information
   */
  async call(
    options: vscode.LanguageModelToolInvocationOptions<object>,
    token: vscode.CancellationToken
  ): Promise<string> {
    const gettingStartedInfo = {
      success: true,
      title: 'Razd Getting Started Guide',
      razdfileTemplate: `mise:
  tools:
    task: latest
tasks:
  default:
    desc: "Set up project and start development"
    cmds:
      - echo "🚀 Setting up project..."
      - task: install
      
  install:
    desc: "Install development tools via mise"
    cmds:
      - echo "📦 Installing tools..."
      - mise install
      
  dev:
    desc: "Start development workflow"
    cmds:
      - echo "🚀 Starting development..."

      
  build:
    desc: "Build project"
    cmds:
      - echo "🔨 Building project..."`,
      miseTools: {
        description:
          'mise is a tool version manager. Configure tools in the mise section of Razdfile.yml',
        commonTools: [
          'task: latest',
          'node: lts',
          'python: 3.11',
          'go: latest',
          'rust: stable'
        ],
        installCommand: 'mise install'
      },
      essentialCommands: [
        {
          command: 'razd',
          description: 'Запускает задачу default'
        },
        {
          command: 'razd install',
          description: 'Установить инструменты через mise'
        },
        {
          command: 'razd dev',
          description: 'Запустить dev-сервер'
        },
        {
          command: 'razd build',
          description: 'Собрать проект'
        },
        {
          command: 'razd run <задача>',
          description: 'Выполнить конкретную задачу'
        },
        {
          command: 'razd --list',
          description: 'Показать все доступные задачи'
        }
      ],
      projectStructure: {
        required: ['Razdfile.yml'],
        optional: ['.mise.toml', 'mise.toml'],
        description:
          'Создайте Razdfile.yml в корне проекта. mise.toml опционален, если используете секцию mise в Razdfile.yml'
      },
      nextSteps: [
        '1. Создайте Razdfile.yml в корне вашего проекта',
        '2. Настройте необходимые mise tools',
        '3. Определите задачи (tasks) для вашего проекта',
        '4. Запустите `razd install` для установки инструментов',
        '5. Запустите `razd` или `razd <задача>` для выполнения задач'
      ],
      links: {
        documentation: 'https://razd-cli.github.io/docs/',
        github: 'https://github.com/razd-cli/razd',
        miseDocumentation: 'https://mise.jdx.dev/'
      }
    };

    return JSON.stringify(gettingStartedInfo, null, 2);
  }

  /**
   * Prepare invocation with user confirmation.
   *
   * Shows a confirmation dialog before providing Razd getting started information.
   *
   * @param options - Prepare options
   * @param token - Cancellation token
   * @returns Prepared invocation with confirmation dialog
   */
  prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<object>,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Providing Razd getting started guide',
      confirmationMessages: {
        title: 'Razd Getting Started Guide',
        message: new vscode.MarkdownString(
          'Show comprehensive guide for setting up Razd project with Razdfile.yml template and essential commands?'
        )
      }
    };
  }
}
