# Руководство по реализации MCP (Language Model Tools) в VS Code расширении

## Введение

На основе анализа расширения PostgreSQL для VS Code (`ms-ossdata.vscode-pgsql`), это руководство описывает как реализовать Language Model Tools (MCP инструменты) в вашем собственном VS Code расширении.

## Архитектура MCP Tools в VS Code

### 1. Декларация инструментов в package.json

Первый шаг - объявить ваши инструменты в секции `contributes.languageModelTools` файла `package.json`:

```json
{
  "contributes": {
    "languageModelTools": [
      {
        "name": "your_tool_name",
        "displayName": "User-Friendly Display Name",
        "toolReferenceName": "your_toolReferenceName",
        "userDescription": "Description shown to users",
        "modelDescription": "Detailed description for the AI model on how to use this tool",
        "icon": "$(icon-name)",
        "tags": [
          "category1",
          "category2"
        ],
        "canBeReferencedInPrompt": true,
        "inputSchema": {
          "type": "object",
          "properties": {
            "param1": {
              "type": "string",
              "description": "Parameter description",
              "title": "Parameter Title"
            }
          },
          "required": ["param1"]
        }
      }
    ]
  }
}
```

#### Ключевые поля:

- **name**: Уникальное имя инструмента (используется в коде)
- **modelDescription**: Детальное описание для AI модели - критически важно! Объясняет КОГДА и КАК использовать инструмент
- **inputSchema**: JSON Schema для валидации параметров (следует спецификации JSON Schema)
- **tags**: Помогают AI модели найти релевантный инструмент
- **canBeReferencedInPrompt**: Позволяет пользователям ссылаться на инструмент в промптах
- **icon**: Codicon для UI (`$(database)`, `$(search)`, и т.д.)

### 2. Структура кода

Рекомендуемая структура файлов:

```
src/
├── services/
│   └── copilot/
│       └── tools/
│           ├── tool.ts                    # Базовый абстрактный класс
│           ├── toolService.ts             # Сервис регистрации
│           └── yourTool/
│               └── yourTool.ts            # Конкретная реализация
```

### 3. Базовый класс Tool

Создайте абстрактный базовый класс для всех ваших инструментов:

```typescript
import * as vscode from 'vscode';

export abstract class Tool implements vscode.LanguageModelTool<object> {
    abstract toolName: string;
    abstract description: string;

    /**
     * Основной метод вызова инструмента
     * Обрабатывает телеметрию и обработку ошибок
     */
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        try {
            const response = await this.call(options, token);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(response)
            ]);
        } catch (error) {
            // Возвращаем структурированную ошибку
            const errorPayload = {
                isError: true,
                message: error instanceof Error ? error.message : String(error),
            };
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(JSON.stringify(errorPayload))
            ]);
        }
    }

    /**
     * Реализуйте вашу бизнес-логику здесь
     * Возвращает строку (обычно JSON)
     */
    abstract call(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<string>;

    /**
     * Опционально: подготовка сообщений подтверждения
     */
    async prepareInvocation?(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolInvocationPrepareOptions<object>>;
}
```

### 4. Реализация конкретного инструмента

Пример простого инструмента без параметров:

```typescript
import * as vscode from 'vscode';
import { Tool } from './tool';

export class ListServersTool extends Tool {
    public readonly toolName = "pgsql_list_servers";
    public readonly description = "List all database servers";

    constructor(private connectionManager: ConnectionManager) {
        super();
    }

    async call(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<string> {
        // Ваша бизнес-логика
        const servers = await this.connectionManager.getServers();
        
        // Верните JSON строку
        return JSON.stringify({ servers });
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolInvocationPrepareOptions<object>> {
        return {
            invocationMessage: "Listing server connections",
            confirmationMessages: {
                title: "List Database Servers",
                message: new vscode.MarkdownString(
                    "List all database servers?"
                )
            }
        };
    }
}
```

Пример инструмента с параметрами:

```typescript
interface ConnectToolInput {
    serverName: string;
    database?: string;
}

export class ConnectTool extends Tool {
    public readonly toolName = "pgsql_connect";
    public readonly description = "Connect to a PostgreSQL server";

    constructor(private connectionManager: ConnectionManager) {
        super();
    }

    async call(
        options: vscode.LanguageModelToolInvocationOptions<ConnectToolInput>,
        token: vscode.CancellationToken
    ): Promise<string> {
        const { serverName, database } = options.input;
        
        try {
            const connectionId = await this.connectionManager.connect(
                serverName, 
                database
            );
            
            return JSON.stringify({ 
                success: true, 
                connectionId,
                message: "Successfully connected."
            });
        } catch (err) {
            return JSON.stringify({ 
                success: false,
                message: err instanceof Error ? err.message : String(err)
            });
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationOptions<ConnectToolInput>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolInvocationPrepareOptions<ConnectToolInput>> {
        const { serverName, database } = options.input;
        
        const confirmationText = database
            ? `Connect to server '${serverName}' and database '${database}'?`
            : `Connect to server '${serverName}'?`;

        return {
            invocationMessage: `Connecting to ${serverName}`,
            confirmationMessages: {
                title: "Connect to Database Server",
                message: new vscode.MarkdownString(confirmationText)
            }
        };
    }
}
```

### 5. Сервис регистрации инструментов

Создайте сервис для централизованной регистрации всех инструментов:

```typescript
import * as vscode from 'vscode';
import { ListServersTool } from './listServersTool';
import { ConnectTool } from './connectTool';

export class ToolService {
    constructor(
        private connectionManager: ConnectionManager,
        // Другие зависимости
    ) {}

    /**
     * Регистрирует все инструменты в VS Code
     */
    registerTools(context: vscode.ExtensionContext): void {
        const tools = [
            new ListServersTool(this.connectionManager),
            new ConnectTool(this.connectionManager),
            // Добавьте другие инструменты
        ];

        tools.forEach((tool) => {
            console.log(`Registering tool: ${tool.toolName}`);
            
            // КЛЮЧЕВОЙ ВЫЗОВ: Регистрация через VS Code API
            context.subscriptions.push(
                vscode.lm.registerTool(tool.toolName, tool)
            );
        });
    }
}
```

### 6. Активация в главном контроллере расширения

В вашем `activate` функции (обычно в `extension.ts` или `mainController.ts`):

```typescript
export async function activate(context: vscode.ExtensionContext) {
    // Инициализируйте зависимости
    const connectionManager = new ConnectionManager();
    
    // Создайте и зарегистрируйте ToolService
    const toolService = new ToolService(connectionManager);
    toolService.registerTools(context);
    
    // Остальная логика активации...
}
```

## Best Practices

### 1. modelDescription - Критически важно!

`modelDescription` - это промпт для AI модели. Он должен быть:
- **Конкретным**: Четко объясняйте, что делает инструмент
- **Контекстным**: Указывайте КОГДА использовать инструмент
- **С примерами**: Показывайте примеры использования если необходимо
- **С ограничениями**: Объясняйте что инструмент НЕ делает

Пример хорошего описания:
```json
{
  "modelDescription": "Run a formatted SQL query against a database. Requires a connectionId from pgsql_connect. This query must not modify the database at all. Can include SELECT, SHOW, EXPLAIN etc. Do not include additional statements like SET search_path. Returns the results of the query.\n\nNote: Always fetch up-to-date database schema context using the pgsql_db_context tool before executing any query."
}
```

### 2. Обработка ошибок

Всегда возвращайте структурированные ошибки в JSON:

```typescript
try {
    // Ваша логика
    return JSON.stringify({ success: true, data: result });
} catch (error) {
    return JSON.stringify({
        isError: true,
        message: error instanceof Error ? error.message : String(error)
    });
}
```

### 3. Возвращайте JSON

AI модели лучше работают со структурированными данными. Всегда возвращайте JSON:

```typescript
return JSON.stringify({
    success: true,
    data: yourData,
    metadata: { timestamp: Date.now() }
});
```

### 4. Используйте Tags для Discovery

Добавляйте релевантные теги, чтобы AI могла найти ваш инструмент:

```json
{
  "tags": ["databases", "postgresql", "pgsql", "query", "sql"]
}
```

### 5. Подтверждения пользователя

Используйте `prepareInvocation` для критичных операций:
- Модификация данных
- Подключения к внешним ресурсам
- Удаление данных

### 6. Input Schema - строгая валидация

Определяйте четкие схемы с `required` полями:

```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "connectionId": {
        "type": "string",
        "description": "Connection ID from pgsql_connect",
        "title": "Connection ID"
      },
      "query": {
        "type": "string",
        "description": "SQL query to execute",
        "title": "SQL Query"
      }
    },
    "required": ["connectionId", "query"]
  }
}
```

### 7. Используйте enum для ограниченных значений

```json
{
  "objectType": {
    "type": "string",
    "enum": ["tables", "indexes", "functions", "all"],
    "description": "Type of database object to fetch"
  }
}
```

## Взаимодействие с backend сервисами

Если ваш инструмент требует взаимодействия с backend (как в примере с PostgreSQL):

```typescript
import { RequestType } from 'vscode-languageclient';

// Определите тип запроса
export namespace QueryRequest {
    export const type = new RequestType<QueryParams, QueryResponse, void>(
        'tools/query'
    );
}

export class QueryTool extends Tool {
    constructor(
        private client: LanguageClient,  // Language Server Client
        private results: ResultsService
    ) {
        super();
    }

    async call(options, token): Promise<string> {
        // Отправьте запрос в backend
        const response = await this.client.sendRequest(
            QueryRequest.type, 
            options.input
        );
        
        // Дождитесь результата
        const result = await this.results.waitForResult(response.responseId);
        
        return JSON.stringify(result);
    }
}
```

## Полный пример: Простой инструмент

Вот полный пример минимального рабочего инструмента:

### package.json
```json
{
  "contributes": {
    "languageModelTools": [
      {
        "name": "my_simple_tool",
        "displayName": "Get Current Time",
        "toolReferenceName": "my_simpleToolReference",
        "userDescription": "Returns the current server time",
        "modelDescription": "Use this tool to get the current timestamp from the server. Returns ISO 8601 formatted date-time string.",
        "icon": "$(clock)",
        "tags": ["time", "utility"],
        "canBeReferencedInPrompt": true,
        "inputSchema": {
          "type": "object",
          "properties": {},
          "required": []
        }
      }
    ]
  }
}
```

### simpleTool.ts
```typescript
import * as vscode from 'vscode';
import { Tool } from './tool';

export class SimpleTool extends Tool {
    public readonly toolName = "my_simple_tool";
    public readonly description = "Returns current time";

    async call(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<string> {
        return JSON.stringify({
            currentTime: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationOptions<object>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolInvocationPrepareOptions<object>> {
        return {
            invocationMessage: "Getting current time",
            confirmationMessages: {
                title: "Get Time",
                message: new vscode.MarkdownString("Get the current server time?")
            }
        };
    }
}
```

### Регистрация
```typescript
// В вашем activate()
const toolService = new ToolService();
toolService.registerTools(context);

// В ToolService
registerTools(context: vscode.ExtensionContext): void {
    const simpleTool = new SimpleTool();
    context.subscriptions.push(
        vscode.lm.registerTool(simpleTool.toolName, simpleTool)
    );
}
```

## Тестирование

После реализации протестируйте в GitHub Copilot Chat:

1. Откройте VS Code с вашим расширением
2. Откройте GitHub Copilot Chat
3. Попробуйте промпты типа:
   - "Use @your_extension to get current time"
   - "Can you call my_simple_tool?"

## Отладка

### Логирование
```typescript
console.log(`Tool ${this.toolName} called with:`, options.input);
```

### Телеметрия
Добавьте телеметрию для мониторинга использования:
```typescript
async invoke(options, token) {
    const startTime = Date.now();
    try {
        const result = await this.call(options, token);
        // Отправьте успешную телеметрию
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(result)
        ]);
    } catch (error) {
        // Отправьте телеметрию ошибки
        throw error;
    }
}
```

## Требования к версии VS Code

Убедитесь что в `package.json`:
```json
{
  "engines": {
    "vscode": "^1.95.0"
  }
}
```

Language Model Tools API доступен в VS Code 1.95+

## Заключение

Ключевые моменты для успешной реализации MCP инструментов:

1. ✅ Декларируйте инструменты в `package.json` с детальным `modelDescription`
2. ✅ Реализуйте базовый класс `Tool`
3. ✅ Создайте конкретные классы инструментов
4. ✅ Зарегистрируйте через `vscode.lm.registerTool()`
5. ✅ Возвращайте структурированный JSON
6. ✅ Обрабатывайте ошибки корректно
7. ✅ Используйте `prepareInvocation` для подтверждений
8. ✅ Добавьте релевантные теги для discovery

---

**Источник анализа**: ms-ossdata.vscode-pgsql v1.10.0  
**Дата создания**: 2025-11-07
