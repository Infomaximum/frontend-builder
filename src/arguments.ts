import type commander from "commander";
import packageJson from "../package.json";
import { runWebpackBuild } from "./scripts/webpack/build";
import { runWebpackDevServer } from "./scripts/webpack/start";
import { Option } from "commander";
import { runProxy } from "./scripts/proxy";
import { getConfigBuilderFromFile } from "./configs/configFile";
import { runRspackDevServer } from "./scripts/rspack/start";
import { runRspackBuild } from "./scripts/rspack/build";

export type TWebpackCacheType = "fs" | "memory";

export type TStartOptions = {
  analyze: boolean;
  proxy_port: string | undefined;
  proxy_ip: string | undefined;
  entry_path?: string;
  circular: boolean;
  write: boolean;
  https: boolean;
  hot: boolean;
  cache: TWebpackCacheType;
  webpack: boolean;
  manualMode: boolean;
  tsCheck: boolean;
};

export type TBuildOptions = {
  output_path?: string;
  analyze: boolean;
  watch: boolean;
  source_map: boolean;
  webpack: boolean;
  tsCheck: boolean;
  zip: string | boolean;
};

export type TProxyOptions = {
  port: string;
  proxy_port: string | undefined;
  proxy_ip: string;
  https: boolean;
  debug: boolean;
};

export const registerCommands = (cli: commander.Command) => {
  cli.helpOption("-h", "Отображает помощь по командам");
  cli.name(packageJson.name);
  cli.version(packageJson.version, "-v, --version", "Текущая версия библиотеки");

  const configGetter = getConfigBuilderFromFile();

  cli
    .command("build")
    .description("Запускает сборку проекта")
    .option(
      "-o, --output_path <path>",
      "Путь куда будет собран билд, по умолчанию папка откуда  выполняется команда",
    )
    .option("-a, --analyze", "Генерирует файл с размерами пакетов в бандле", false)
    .option("-w, --watch", "Отслеживает изменения и автоматически перезапускает сборку", false)
    .option("-s, --source_map", "Генерировать sourse map", false)
    .option("--webpack", "Сборка с использованием webpack", false)
    .option("--no-ts-check", "Пропуск проверки кода тайпскриптом")
    .option("--zip [name]", "Упаковать в архив", false)
    .action((options: TBuildOptions) =>
      (options.webpack ? runWebpackBuild : runRspackBuild)(
        options,
        configGetter({ isManualModulesMode: false }),
      ),
    );

  cli
    .command("start")
    .description("Запускает проект в dev режиме")
    .option("-ph, --proxy_ip <ip>", "IP для проксирования запросов")
    .option("-pp, --proxy_port <port>", "Порт для проксирования запросов")
    .option("-s, --https", "Проксирование на https/wss хост", false)
    .option("-a, --analyze", "Генерирует файл с размерами пакетов в бандле", false)
    .option("-e, --entry_path <path>", "Путь до входной точки приложения")
    .option("-c, --circular", "Включает отслеживание циклических зависимостей", false)
    .option("-w, --write", "Записывает выходные данные на диск вместо оперативной памяти", false)
    .option("--hot", "Включает режим HMR", false)
    .option("--webpack", "Разработка с использованием webpack", false)
    .option(
      "-m, --manual-mode",
      "Включает ручной режим сборки: модули не собираются автоматически, пользователь должен явно указать, какие модули подключать и собирать",
      false,
    )
    .addOption(
      new Option("--cache <cache type>", "Используемый тип кеша webpack")
        .default("memory" satisfies TWebpackCacheType)
        .choices(["fs", "memory"] satisfies TWebpackCacheType[]),
    )
    .option("--no-ts-check", "Пропуск проверки кода тайпскриптом")
    .action((options: TStartOptions) =>
      (options.webpack ? runWebpackDevServer : runRspackDevServer)(
        options,
        configGetter({ isManualModulesMode: options.manualMode }),
      ),
    );

  cli
    .command("proxy")
    .description("Запускает проксирование собранного проекта на указанный хост")
    .option("-p, --port <port>", "Порт на котором будет запущен сервер", "3000")
    .option("-ph, --proxy_ip <ip>", "IP для проксирования запросов", "localhost")
    .option("-pp, --proxy_port <port>", "Порт для проксирования запросов")
    .option("-s, --https", "Проксирование на https/wss хост", false)
    .option("-d, --debug", "Отладка проксирования запросов", false)
    .action((options: TProxyOptions) =>
      runProxy(options, configGetter({ isManualModulesMode: false })),
    );
};
