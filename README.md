# @infomaximum/builder

<a href="https://www.npmjs.com/package/@infomaximum/builder">
  <img alt="npm" src="https://img.shields.io/npm/v/@infomaximum/builder?style=for-the-badge">
</a>

Сборщик фронтенд-приложений Infomaximum на React и TypeScript. Одна команда `im-builder` собирает приложение, запускает dev server с проксированием на бэкенд и раздает готовую сборку.

По умолчанию сборка идет на [rspack](https://rspack.rs). Флаг `--webpack` переключает на webpack.

## Содержание

- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Команды](#команды)
  - [build](#build)
  - [start](#start)
  - [proxy](#proxy)
  - [Адрес проксирования](#адрес-проксирования)
- [Файл imbuilder.config.js](#файл-imbuilderconfigjs)
- [Шаблон index.pug](#шаблон-indexpug)
- [Результат сборки](#результат-сборки)
- [Информация о сборке](#информация-о-сборке)
- [Переменные process.env](#переменные-processenv)
- [Что поддерживается из коробки](#что-поддерживается-из-коробки)
- [Разработка сборщика](#разработка-сборщика)

## Установка

```bash
yarn add -D @infomaximum/builder
```

## Быстрый старт

1. Укажите входной файл в `main` в `package.json`. Если в `imbuilder.config.js` нет `entries`, сборщик берет вход отсюда. Если файла по `main` нет, берется `src/index.*`.
2. Создайте шаблон страницы `index.pug` и укажите путь к нему в `pugFilePath` (см. [Шаблон index.pug](#шаблон-indexpug)).
3. Добавьте скрипты:

```json
{
  "main": "src/index.tsx",
  "scripts": {
    "start": "im-builder start",
    "build": "im-builder build",
    "proxy": "im-builder proxy"
  }
}
```

Справка по командам: `yarn im-builder -h`, по конкретной команде: `yarn im-builder build -h`.

## Команды

### build

Production-сборка в `_release/`. Перед сборкой `_release/` очищается.

```bash
im-builder build [параметры]
```

| Параметр                   | По умолчанию      | Описание                                                                                           |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `-o, --output_path <path>` | текущая папка     | Папка, внутри которой будет создан `_release/`. `outputPath` из `imbuilder.config.js` приоритетнее |
| `-a, --analyze`            | выключен          | Отчет о размерах бандла: rsdoctor в `.rsdoctor/` (rspack) или webpack-bundle-analyzer (webpack)    |
| `-w, --watch`              | выключен          | Пересобирать при изменениях. `_release/` очищается только перед первой сборкой                     |
| `-s, --source_map`         | выключен          | Генерировать source map                                                                            |
| `--webpack`                | выключен          | Собирать webpack вместо rspack                                                                     |
| `--no-ts-check`            | проверка включена | Не проверять типы TypeScript во время сборки                                                       |
| `--zip [name]`             | выключен          | Упаковать сборку в архив в корне проекта: `<name>.zip` или `release_ДД-ММ-ГГГГ_ЧЧ-ММ.zip`          |
| `--no-build-info`          | файл создается    | Не создавать `build-info.json` (см. [Информация о сборке](#информация-о-сборке))                   |

### start

Dev server на `0.0.0.0`. Запросы из `devServer.proxy.proxyHTTPPaths` и `proxyWSPaths` проксируются на бэкенд. Неизвестные пути отдают `index.html` (history API fallback). Мониторинг dev server — по адресу `/status`.

```bash
im-builder start [параметры]
```

| Параметр                   | По умолчанию                              | Описание                                                                                 |
| -------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `-p, --port <port>`        | `devServer.defaultPort`, иначе `3000`     | Порт dev server. Если порт занят, в интерактивном терминале сборщик предложит свободный  |
| `-ph, --proxy_host <host>` | `devServer.proxy.host`, иначе `localhost` | Хост бэкенда. Можно со схемой и портом: `https://example.com:8091`                       |
| `-pp, --proxy_port <port>` | `devServer.proxy.port`, иначе `8091`      | Порт бэкенда, если он не указан в `--proxy_host`                                         |
| `-s, --https`              | выключен                                  | Проксировать на https/wss. Учитывается, только если схема не указана в `--proxy_host`    |
| `--secure` / `--no-secure` | включена для https/wss                    | Проверять SSL сертификат бэкенда. Для самоподписанного сертификата нужен `--no-secure`   |
| `-a, --analyze`            | выключен                                  | Отчет о размерах бандла: rsdoctor (rspack) или webpack-bundle-analyzer (webpack)         |
| `-e, --entry_path <path>`  | —                                         | Сейчас не используется: вход задают `entries` или `main`                                 |
| `-c, --circular`           | выключен                                  | Искать циклические зависимости, цикл считается ошибкой сборки                            |
| `-w, --write`              | выключен                                  | Писать сборку на диск, а не держать в памяти                                             |
| `--hot`                    | выключен                                  | HMR и React Refresh                                                                      |
| `-m, --manual-mode`        | выключен                                  | Ручной режим модулей: передается в `imbuilder.config.js` как `isManualModulesMode: true` |
| `--cache <fs\|memory>`     | `memory`                                  | Тип кеша, только с `--webpack`                                                           |
| `--webpack`                | выключен                                  | Dev server на webpack вместо rspack                                                      |
| `--no-ts-check`            | проверка включена                         | Не проверять типы TypeScript                                                             |

### proxy

Раздает уже собранный `_release/` и проксирует запросы на бэкенд. Нужен, чтобы проверить production-сборку локально. Неизвестные пути отдают `index.html`.

```bash
im-builder build && im-builder proxy -ph https://example.com:8091
```

| Параметр                   | По умолчанию                              | Описание                                                                            |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `-p, --port <port>`        | `3000`                                    | Порт сервера                                                                        |
| `-ph, --proxy_host <host>` | `devServer.proxy.host`, иначе `localhost` | Хост бэкенда, можно со схемой и портом                                              |
| `-pp, --proxy_port <port>` | `devServer.proxy.port`                    | Порт бэкенда, если он не указан в `--proxy_host`. Без него — стандартный порт схемы |
| `-s, --https`              | выключен                                  | Проксировать на https/wss, если схема не указана в `--proxy_host`                   |
| `--secure` / `--no-secure` | включена для https/wss                    | Проверять SSL сертификат бэкенда                                                    |
| `-d, --debug`              | выключен                                  | Печатать в консоль каждый проксируемый запрос и ответ                               |

### Адрес проксирования

Команды `start` и `proxy` собирают адрес бэкенда одинаково:

- **Хост:** `--proxy_host`, иначе `devServer.proxy.host`, иначе `localhost`.
- **Схема:** из хоста, если она в нем указана (`http`, `https`, `ws`, `wss`), иначе `https` при `-s`, иначе `http`.
- **Порт:** из хоста, иначе `--proxy_port`, иначе `devServer.proxy.port`, иначе `8091` в `start` и стандартный порт схемы в `proxy`.
- **Проверка сертификата:** `--secure`/`--no-secure`, иначе `devServer.proxy.secure`, иначе включена для https/wss.

Если сертификат бэкенда не прошел проверку, запрос получает ответ 502 с причиной, а в консоли появляется подсказка про `--no-secure`.

## Файл imbuilder.config.js

Необязательный файл в корне проекта. Экспортирует объект или функцию, которая получает `{ isManualModulesMode }` и возвращает объект.

```js
// @ts-check
const path = require("path");

/** @type {import("@infomaximum/builder/dist/src/configs/configFile").ImFuncBuilderConfig} */
module.exports = ({ isManualModulesMode }) => ({
  entries: [path.resolve(__dirname, "src/index.tsx")],
  outputPath: ".",
  pugFilePath: path.resolve(__dirname, "assets/index.pug"),
  devServer: {
    defaultPort: 3000,
    proxy: {
      host: "localhost",
      port: 8091,
      proxyHTTPPaths: ["/graphql"],
      proxyWSPaths: ["/ws"],
    },
  },
});
```

| Поле                             | Описание                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extends`                        | Путь или имя модуля с базовой конфигурацией. Поля текущего файла глубоко сливаются с базовыми, массивы заменяются целиком. Цепочки допустимы, цикл — ошибка |
| `entries`                        | Входные точки: массив путей или функция, которая его возвращает. Без поля вход берется из `main` в `package.json`                                           |
| `outputPath`                     | Папка, внутри которой будет создан `_release/`. Приоритетнее `--output_path`                                                                                |
| `pugFilePath`                    | Путь к шаблону `index.pug`. Без него `index.html` не создается                                                                                              |
| `devServer.defaultPort`          | Порт dev server, если не указан `--port`                                                                                                                    |
| `devServer.proxy.proxyHTTPPaths` | Пути HTTP-запросов, которые проксируются на бэкенд                                                                                                          |
| `devServer.proxy.proxyWSPaths`   | Пути websocket, которые проксируются на бэкенд                                                                                                              |
| `devServer.proxy.host`           | Хост бэкенда, можно со схемой и портом                                                                                                                      |
| `devServer.proxy.port`           | Порт бэкенда, если он не указан в `host`                                                                                                                    |
| `devServer.proxy.secure`         | Проверять ли SSL сертификат бэкенда                                                                                                                         |
| `devServer.allowedHosts`         | Хосты, с которых разрешено открывать dev server                                                                                                             |
| `devServer.customMiddlewares`    | `(middlewares, devServer) => middlewares` — добавить свои middleware в dev server                                                                           |

## Шаблон index.pug

`index.html` собирается из pug-шаблона. Скрипты и стили сборщик в шаблон не вставляет, шаблон подключает их сам:

```pug
doctype html
html
  head
    meta(charset="UTF-8")
    each css in htmlWebpackPlugin.files.css
      link(rel="stylesheet" href=css)
  body
    #root
    each js in htmlWebpackPlugin.files.js
      script(src=js)
```

В шаблоне доступны `htmlWebpackPlugin.options.staticPath` (`/_build/static`), `faviconPath` (`/favicon.ico`), `imagePath` (`/_build/static/img`), `fontsPath` (`/_build/static/fonts`) и `buildDir` (абсолютный путь к `_release/`).

## Результат сборки

```
_release/
├── index.html
├── build-info.json
├── favicon.ico            # если приложение импортирует .ico
└── _build/static/
    ├── js/                # [name].[contenthash].js
    ├── css/               # [name].[contenthash].css
    ├── img/
    ├── fonts/
    └── wasm/
```

Пути в сборке начинаются с `/`, приложение раздается из корня сайта.

## Информация о сборке

Команда `build` кладет в корень `_release/`, рядом с `index.html`, файл `build-info.json`:

```json
{
  "version": "260806",
  "build_time": 1794816180000,
  "hash": "53a1b40c",
  "branch": "tags/v260806"
}
```

| Поле         | Значение                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `version`    | Номер выпуска без `v`, если сборка сделана точно с тега вида `vГГММNN` (`$CI_COMMIT_TAG` или тег на `HEAD`), иначе `null` |
| `build_time` | Время сборки, мс эпохи. То же значение, что `process.env.BUILD_TIME`                                                      |
| `hash`       | Первые 8 символов хеша коммита. То же значение, что `process.env.LAST_COMMIT_HASH`                                        |
| `branch`     | Ветка или тег по `git name-rev`. То же значение, что `process.env.BRANCH`                                                 |

`version` не вычисляется из `branch`: `git name-rev` называет коммит по ближайшему тегу **после** него. Сборка за несколько коммитов до тега `v260806` получает `branch: "tags/v260806"`, но `version: null`.

Файл не создается с `--no-build-info` и в команде `start`.

## Переменные process.env

Сборщик подставляет в код приложения значения на этапе сборки:

| Переменная                     | Значение                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `process.env.NODE_ENV`         | `"production"` в `build`, `"development"` в `start`                                                           |
| `process.env.DEBUG`            | `true` в `start`, `false` в `build`                                                                           |
| `process.env.BUILD_TIME`       | Время сборки, мс эпохи                                                                                        |
| `process.env.LAST_COMMIT_HASH` | Первые 8 символов хеша коммита, пустая строка вне git                                                         |
| `process.env.BRANCH`           | Ветка или тег по `git name-rev`, без суффикса `~N`                                                            |
| `process.env.VERSIONS`         | Объект: имя пакета из корневого `package.json` → `BRANCH`, имя каждого пакета из `packages/*` → его `version` |
| `process.env.SHOW_BUILD_INFO`  | Всегда `true`                                                                                                 |
| `process.env.BUILD_DIR`        | Абсолютный путь к `_release/` на машине сборки                                                                |

## Что поддерживается из коробки

- **TypeScript и JavaScript:** swc в rspack, babel и ts-loader в webpack. JSX с `@emotion/react`, декораторы, полифилы `core-js`.
- **Стили:** CSS через postcss-preset-env. Less — только с `--webpack`.
- **SVG:** `import Icon from "./icon.svg"` — React-компонент (svgr), `./icon.svg?url` — URL или data URL до 64 КБ, `./icon.svg?src` — исходный текст.
- **Картинки** `png`, `jpg`, `gif`, `cur` — в `_build/static/img/`, **шрифты** `woff`, `woff2`, `ttf`, `eot` — в `_build/static/fonts/`, `.ico` — в корень сборки.
- **WebAssembly** через `asyncWebAssembly`.
- **Прочее:** глобальный `Buffer`, из локалей moment остаются только `ru` и `en`.

## Разработка сборщика

```bash
yarn install
yarn build     # компиляция в dist/
yarn lint      # проверка типов
```

Проверить изменения в проекте до выпуска: `yarn link` в папке сборщика и `yarn link @infomaximum/builder` в проекте, или запуск `node <путь к сборщику>/dist/bin/builder.js build` из папки проекта.

Коммиты — в формате [Conventional Commits](https://www.conventionalcommits.org/ru/): по ним `standard-version` вычисляет версию и пишет `CHANGELOG.md`.

**Выпуск:** GitHub Actions → workflow «Create Release» → Run workflow (флаг «Предварительный релиз?» для rc). Workflow поднимает версию, пишет CHANGELOG, ставит тег, пушит его и публикует пакет в npm.
