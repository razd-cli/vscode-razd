# Specification Delta: File Detection

**Capability:** `file-detection`  
**Change ID:** `add-razdfile-support`

## ADDED Requirements

### Requirement: Razdfile Detection Support

The system MUST detect and work with Razdfile format files (`Razdfile.yml`, `Razdfile.yaml`, `razdfile.yml`, `razdfile.yaml`) in addition to existing Taskfile support.

**ID:** REQ-FD-001

**Rationale:** Поддержка проекта razd-cli требует возможности работы с альтернативными именами файлов конфигурации задач.

**Priority:** High

**Dependencies:** None

#### Scenario: Обнаружение Razdfile.yml в чистой директории

**Given:**
- Директория содержит только файл `Razdfile.yml`
- Нет других файлов конфигурации задач (Taskfile.yml и его вариантов)

**When:**
- Пользователь вызывает команду открытия файла задач для этой директории

**Then:**
- Система обнаруживает и открывает `Razdfile.yml`
- Логируется сообщение о найденном файле
- Файл открывается в редакторе VSCode без режима preview

#### Scenario: Обнаружение вариантов написания Razdfile

**Given:**
- В разных директориях присутствуют файлы: `Razdfile.yml`, `Razdfile.yaml`, `razdfile.yml`, `razdfile.yaml`
- Каждая директория содержит только один файл конфигурации

**When:**
- Пользователь вызывает команду открытия файла задач для каждой директории

**Then:**
- Система корректно обнаруживает и открывает каждый вариант файла
- Все четыре варианта написания поддерживаются

### Requirement: Обратная совместимость с Taskfile

All existing Taskfile.yml functionality MUST remain unchanged.

**ID:** REQ-FD-002

**Rationale:** Предотвращение регрессии для существующих пользователей расширения.

**Priority:** Critical

**Dependencies:** REQ-FD-001

#### Scenario: Приоритет при наличии нескольких файлов

**Given:**
- Директория содержит одновременно `Taskfile.yml` и `Razdfile.yml`

**When:**
- Пользователь вызывает команду открытия файла задач

**Then:**
- Система открывает файл согласно определенному приоритету
- Приоритет: Taskfile.yml имеет преимущество перед Razdfile.yml
- Логируется информация об открытом файле

#### Scenario: Работа с существующими Taskfile проектами

**Given:**
- Директория содержит только `Taskfile.yml`
- Нет файлов Razdfile

**When:**
- Пользователь выполняет любые операции с расширением (открытие, чтение, выполнение задач)

**Then:**
- Все операции работают идентично поведению до внедрения изменений
- Нет изменений в производительности или пользовательском опыте
- Логирование сохраняет прежний формат

#### Scenario: Регрессионное тестирование всех вариантов Taskfile

**Given:**
- Директории с файлами: `Taskfile.yml`, `Taskfile.yaml`, `taskfile.yml`, `taskfile.yaml`

**When:**
- Выполняются команды расширения для каждой директории

**Then:**
- Каждый вариант обнаруживается и обрабатывается корректно
- Порядок приоритета среди вариантов Taskfile не изменился

### Requirement: Расширенное логирование

The system MUST log information about detected files to facilitate debugging.

**ID:** REQ-FD-003

**Rationale:** Упрощение диагностики проблем при работе с несколькими типами файлов.

**Priority:** Medium

**Dependencies:** REQ-FD-001

#### Scenario: Логирование обнаруженного файла

**Given:**
- Директория содержит файл конфигурации задач (Taskfile или Razdfile)

**When:**
- Система обнаруживает и открывает файл

**Then:**
- В лог записывается полный путь к открытому файлу
- Сообщение включает тип файла и директорию
- Формат: `Opening task definition file: "<полный путь>"`

#### Scenario: Логирование при отсутствии файлов

**Given:**
- Директория не содержит ни Taskfile, ни Razdfile

**When:**
- Пользователь пытается открыть файл задач

**Then:**
- Функция завершается без ошибки
- В лог записывается информация о попытке поиска
- Пользователь не видит сообщения об ошибке (существующее поведение)

## MODIFIED Requirements

None. Это изменение добавляет новую функциональность без модификации существующих требований.

## REMOVED Requirements

None. Изменение не удаляет существующую функциональность.

## Implementation Notes

1. **Файл:** `src/services/taskfile.ts`
2. **Метод:** `open(dir: string): Promise<void>`
3. **Изменение:** Расширить массив `filenames` для включения вариантов Razdfile
4. **Порядок:** `['Taskfile.yml', 'Taskfile.yaml', 'taskfile.yml', 'taskfile.yaml', 'Razdfile.yml', 'Razdfile.yaml', 'razdfile.yml', 'razdfile.yaml']`

## Cross-References

- **Related Specs:** None (первая спецификация в проекте)
- **Related Changes:** None

## Validation Criteria

1. Все новые сценарии проходят тестирование
2. Все существующие тесты продолжают проходить (регрессионное тестирование)
3. Ручное тестирование подтверждает корректную работу в VSCode
4. `openspec validate --strict` проходит без ошибок

## Acceptance Criteria

- [ ] Реализованы все требования REQ-FD-001, REQ-FD-002, REQ-FD-003
- [ ] Созданы unit-тесты для всех сценариев
- [ ] Создан integration-тест с реальными файлами
- [ ] Обновлена документация (README.md)
- [ ] Проведено ручное тестирование в VSCode
- [ ] Проверена работа на Windows, Linux, macOS (если возможно)
