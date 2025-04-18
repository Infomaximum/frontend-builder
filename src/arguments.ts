import type commander from "commander";
import packageJson from "../package.json";
import { runBuild } from "./scripts/build";
import { runDevServer } from "./scripts/start";
import { Option } from "commander";
import { runProxy } from "./scripts/proxy";
import { getConfigBuilderFromFile } from "./configs/configFile";

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
};

export type TBuildOptions = {
  output_path?: string;
  analyze: boolean;
  watch: boolean;
  source_map: boolean;
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

  const config = getConfigBuilderFromFile();

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
    .action((options: TBuildOptions) => runBuild(options, config));

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
    .addOption(
      new Option("--cache <cache type>", "Используемый тип кеша webpack")
        .default("memory" satisfies TWebpackCacheType)
        .choices(["fs", "memory"] satisfies TWebpackCacheType[]),
    )
    .action((options: TStartOptions) => runDevServer(options, config));

  cli
    .command("proxy")
    .description("Запускает проксирование собранного проекта на указанный хост")
    .option("-p, --port <port>", "Порт на котором будет запущен сервер", "3000")
    .option("-ph, --proxy_ip <ip>", "IP для проксирования запросов", "localhost")
    .option("-pp, --proxy_port <port>", "Порт для проксирования запросов")
    .option("-s, --https", "Проксирование на https/wss хост", false)
    .option("-d, --debug", "Отладка проксирования запросов", false)
    .action((options: TProxyOptions) => runProxy(options, config));
};
