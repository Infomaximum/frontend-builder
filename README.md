  <a href="https://www.npmjs.com/package/@infomaximum/builder">
<img alt="npm" src="https://img.shields.io/npm/v/@infomaximum/builder?style=for-the-badge">
  </a>

## Основные команды

> Получить помощь по командам можно выполнив `yarn im-builder -h`, по всем вложенным командам помощь доступна также с использованием флага `-h`, например, `yarn im-builder start -h`

## Информация о сборке

Команда `build` кладет в корень артефакта (`_release/`, рядом с `index.html`) файл `build-info.json`:

```json
{
  "version": "260806",
  "build_time": 1794816180000,
  "hash": "53a1b40c",
  "branch": "tags/v260806"
}
```

| Поле         | Значение                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`    | номер выпуска без `v`, если сборка сделана точно с тега вида `vГГММNN` (`$CI_COMMIT_TAG` или тег на `HEAD`); иначе `null`                    |
| `build_time` | время сборки, мс эпохи, то же значение, что `process.env.BUILD_TIME`                                                                         |
| `hash`       | первые 8 символов хеша коммита, то же значение, что `process.env.LAST_COMMIT_HASH`                                                           |
| `branch`     | ветка или тег по `git name-rev`, то же значение, что `process.env.BRANCH`; сборка за несколько коммитов до тега тоже показывает этот тег |

`version` из `branch` не вычисляется: `git name-rev` называет коммит по ближайшему тегу после него. Отключить файл: `im-builder build --no-build-info`.

---
