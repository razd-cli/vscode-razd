# Design: Add Razdfile Support

**Change ID:** `add-razdfile-support`

## Architecture Overview

Изменение затрагивает только класс `TaskfileService` в файле `src/services/taskfile.ts`. Основная логика заключается в расширении списка поддерживаемых имен файлов для обнаружения.

## Current Implementation

### Метод `open()`

Текущая реализация:
```typescript
public async open(dir: string): Promise<void> {
    let filenames = ['Taskfile.yml', 'Taskfile.yaml', 'taskfile.yml', 'taskfile.yaml'];
    for (let i = 0; i < filenames.length; i++) {
        let filename = path.join(dir, filenames[i]);
        if (fs.existsSync(filename)) {
            log.info(`Opening taskfile: "${filename}"`);
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filename), { preview: false });
            return;
        }
    }
}
```

**Анализ:**
- Линейный поиск по массиву имен файлов
- Первый найденный файл открывается
- Порядок массива определяет приоритет

### Метод `init()`

```typescript
public async init(dir: string): Promise<void> {
    log.info(`Initialising taskfile in: "${dir}"`);
    return await new Promise((resolve) => {
        let command = this.command('up --init');
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
```

**Анализ:**
- Вызывает команду CLI `task --init`
- CLI определяет, какой файл создавать (обычно `Taskfile.yml`)
- После создания вызывает `open()` для открытия созданного файла

## Proposed Solution

### Вариант 1: Простое расширение массива (Рекомендуемый)

**Преимущества:**
- Минимальные изменения кода
- Простота реализации
- Прозрачность для пользователя

**Недостатки:**
- Фиксированный приоритет без возможности настройки

**Реализация:**

```typescript
public async open(dir: string): Promise<void> {
    // Приоритет: Taskfile > Razdfile (сохранение обратной совместимости)
    let filenames = [
        'Taskfile.yml',   // Высший приоритет
        'Taskfile.yaml',
        'taskfile.yml',
        'taskfile.yaml',
        'Razdfile.yml',   // Альтернативные имена
        'Razdfile.yaml',
        'razdfile.yml',
        'razdfile.yaml'
    ];
    
    for (let i = 0; i < filenames.length; i++) {
        let filename = path.join(dir, filenames[i]);
        if (fs.existsSync(filename)) {
            log.info(`Opening taskfile: "${filename}"`);
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filename), { preview: false });
            return;
        }
    }
}
```

### Вариант 2: С настройкой приоритета

**Преимущества:**
- Гибкость для пользователя
- Возможность изменить приоритет без изменения кода

**Недостатки:**
- Усложнение кода
- Дополнительная настройка для пользователя
- Увеличение когнитивной нагрузки

**Реализация:**

```typescript
// В settings.ts добавить:
export enum FilenamePriority {
    taskfile = "taskfile",
    razdfile = "razdfile"
}

// В Settings class:
public filenamePriority!: FilenamePriority;

// В TaskfileService.open():
public async open(dir: string): Promise<void> {
    let taskfileNames = ['Taskfile.yml', 'Taskfile.yaml', 'taskfile.yml', 'taskfile.yaml'];
    let razdfileNames = ['Razdfile.yml', 'Razdfile.yaml', 'razdfile.yml', 'razdfile.yaml'];
    
    let filenames = settings.filenamePriority === FilenamePriority.taskfile
        ? [...taskfileNames, ...razdfileNames]
        : [...razdfileNames, ...taskfileNames];
    
    for (let i = 0; i < filenames.length; i++) {
        let filename = path.join(dir, filenames[i]);
        if (fs.existsSync(filename)) {
            log.info(`Opening taskfile: "${filename}"`);
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filename), { preview: false });
            return;
        }
    }
}
```

## Technical Decisions

### Решение 1: Порядок приоритета файлов

**Рекомендация:** Использовать Вариант 1 с приоритетом Taskfile > Razdfile

**Обоснование:**
1. Сохраняется обратная совместимость
2. Пользователи с существующими Taskfile.yml не увидят изменений
3. Новые пользователи razd могут использовать Razdfile.yml в чистых проектах
4. Простота реализации и поддержки

### Решение 2: Обработка метода `init()`

**Рекомендация:** Оставить без изменений, полагаясь на CLI

**Обоснование:**
1. CLI инструмент (task или razd) сам определяет, какой файл создавать
2. Метод `open()` после инициализации найдет созданный файл автоматически
3. Нет необходимости дублировать логику CLI в расширении

### Решение 3: Логирование и сообщения

**Рекомендация:** Обобщить сообщения для поддержки обоих типов файлов

**Текущее:** `Opening taskfile: "${filename}"`  
**Предложенное:** `Opening task definition file: "${filename}"` или оставить как есть

**Обоснование:** Термин "taskfile" является достаточно общим и может применяться к обоим форматам

## Edge Cases

1. **Оба файла в одной директории:**
   - Поведение: Открывается файл с более высоким приоритетом
   - Предупреждение: Опционально можно добавить warning в лог

2. **Символические ссылки:**
   - `fs.existsSync()` следует по симлинкам автоматически
   - Дополнительная обработка не требуется

3. **Права доступа:**
   - Текущая реализация не проверяет права на чтение
   - Предложенная реализация сохраняет это поведение

## Testing Strategy

1. **Unit Tests:**
   - Тест обнаружения каждого варианта файла
   - Тест приоритета при наличии нескольких файлов
   - Регрессионные тесты для Taskfile

2. **Integration Tests:**
   - Полный цикл: init → open → read → run
   - Тесты с реальными файлами в test-workspace

3. **Manual Testing:**
   - Создание проекта с Razdfile.yml
   - Миграция проекта с Taskfile.yml на Razdfile.yml
   - Смешанные сценарии

## Performance Considerations

**Влияние:** Минимальное

- Добавлено 4 дополнительных вызова `fs.existsSync()`
- В худшем случае (файл не найден): 8 проверок вместо 4
- Среднее время одной проверки: <1ms
- Общее влияние: <4ms в худшем случае

**Оптимизация не требуется** для данного масштаба изменений.

## Rollback Plan

В случае проблем:
1. Удалить Razdfile варианты из массива `filenames`
2. Откатить изменения в документации
3. Удалить соответствующие тесты

Изменения локализованы и легко обратимы.

## Future Considerations

1. **Кастомные имена файлов:**
   - Настройка `taskfile.customFilenames: string[]`
   - Позволит пользователям добавлять свои варианты

2. **Автоопределение по содержимому:**
   - Проверка наличия специфических полей в YAML
   - Более надежная, но медленная

3. **Поддержка других расширений:**
   - `.toml`, `.json` версии файлов конфигурации
   - Требует изменений в CLI

## References

- Task documentation: https://taskfile.dev
- Similar patterns в других расширениях (например, Makefile detection)
