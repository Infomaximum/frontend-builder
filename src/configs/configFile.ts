import { rcFile } from "rc-config-loader";
import { BUILDER_CONFIG_FILE_EXT, BUILDER_CONFIG_FILE_NAME } from "../const";
import { deepMerge } from "../utils";
import path from "path";
import type { Middleware } from "webpack-dev-server";
import type Server from "webpack-dev-server";

type ProxyConfig = {
  /**
   * Список HTTP url для проксирования dev server
   */
  proxyHTTPPaths?: string[];
  /**
   * Список websocket url для проксирования dev server
   */
  proxyWSPaths?: string[];

  /**
   * Хост на который будет происходить проксирование всех запросов
   */
  host: string;

  /**
   * Порт на который будет происходить проксирование всех запросов
   */
  port: number;
};

type DevServerConfig = {
  /**
   * Порт по умолчанию на котором будет запущен dev server
   */
  defaultPort: number;
  /**
   * Конфигурация проксирования
   */
  proxy?: ProxyConfig;
  customMiddlewares?: (middlewares: Middleware[], devServer: Server) => Middleware[];
};

export type ImBuilderConfig = {
  /**
   * путь до базовой конфигурации от которой нужно наследовать общие параметры
   */
  extends?: string;
  /**
   * список энтрипоинтов
   */
  entries: string[] | (() => string[]);
  outputPath: string;
  pugFilePath?: string;
  /**
   * Конфигурация dev server
   */
  devServer?: DevServerConfig;
};

export function getConfigBuilderFromFile(): ImBuilderConfig | undefined {
  const config = rcFile<ImBuilderConfig>(BUILDER_CONFIG_FILE_NAME, {
    cwd: process.cwd(),
    packageJSON: false,
    configFileName: BUILDER_CONFIG_FILE_NAME,
    defaultExtension: BUILDER_CONFIG_FILE_EXT,
  })?.config;

  let resultConfig = config;

  if (config?.extends) {
    const { extends: _extends, ...rest } = config;

    const baseConfig = loadConfig(_extends);

    resultConfig = deepMerge(baseConfig, rest) as ImBuilderConfig;
  }

  return prepareConfigPaths(resultConfig);
}

function prepareConfigPaths(config: ImBuilderConfig | undefined): ImBuilderConfig | undefined {
  if (!config) {
    return config;
  }

  if (config.entries) {
    config.entries = (typeof config.entries === "function" ? config.entries() : config.entries).map(
      (p) => resolvePathFromModule(p),
    );
  }

  if (config.pugFilePath) {
    config.pugFilePath = resolvePathFromModule(config.pugFilePath);
  }

  if (config.outputPath) {
    config.outputPath = path.resolve(config.outputPath);
  }

  return config;
}

function loadConfig(configPath: string, visited = new Set()): any {
  const resolvedPath = resolvePathFromModule(configPath);

  if (visited.has(resolvedPath)) {
    throw new Error(`Circular config detected: ${resolvedPath}`);
  }

  visited.add(resolvedPath);

  const config = require(resolvedPath);

  if (config.extends) {
    const { extends: _extends, ...rest } = config;

    const baseConfig = loadConfig(_extends, visited);

    return deepMerge(baseConfig, rest);
  }

  return config;
}

export function resolvePathFromModule(path: string, basePath = process.cwd()) {
  return require.resolve(path, {
    paths: [basePath],
  });
}
