import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { choosePort } from "react-dev-utils/WebpackDevServerUtils";
import { generatePaths, type TMode, type TPaths } from "../paths";
import { merge } from "webpack-merge";
import { getDevServerConfig } from "../configs/webpack/devServer";
import chalk from "chalk";
import { getCommonConfig } from "../configs/webpack/common";
import { getLoaders } from "../configs/webpack/loaders";
import { getHTMLConfig } from "../configs/webpack/htmlConfig";
import { tsChecker } from "../configs/webpack/tsChecker";
import type { TStartOptions } from "../arguments";
import { getBundleAnalyzerConfig } from "../configs/webpack/bundleAnalyzer";
import { circularDependencyDetector } from "../configs/webpack/circularDep";
import { getWebpackCacheConfig } from "../configs/webpack/cache";
import type { ImBuilderConfig } from "../configs/configFile";

export const runDevServer = async (options: TStartOptions, config: ImBuilderConfig | undefined) => {
  const PATHS = generatePaths({
    outputPath: undefined,
  });

  try {
    await run(PATHS, options, config);
  } catch (error: any) {
    if (error?.message) {
      console.log(chalk.red(error.message));
    }

    process.exit(1);
  }
};

const run = async (PATHS: TPaths, options: TStartOptions, config: ImBuilderConfig | undefined) => {
  const { devServerHost, appPath } = PATHS;
  let port = config?.devServer?.defaultPort;

  const defaultPort = config?.devServer?.defaultPort ?? 3000;

  try {
    port = (await choosePort(devServerHost, defaultPort)) ?? defaultPort;
  } catch (e) {
    console.error(chalk.red(e));

    process.exit(1);
  }

  const mode: TMode = "development";

  const isHot = options.hot;

  const entries = config?.entries ?? [PATHS.moduleIndex];

  const configWebpack = [
    await getCommonConfig({ mode, PATHS, isHot, entries }),
    getWebpackCacheConfig(options.cache),
    getLoaders(mode, PATHS),
    getHTMLConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    options.analyze ? getBundleAnalyzerConfig() : {},
    tsChecker,
    options.circular ? circularDependencyDetector : {},
  ];

  const compiler = webpack(merge(configWebpack));

  const proxy = {
    proxyPort: options.proxy_port,
    proxyHost: options.proxy_ip,
    proxyHttpPaths: config?.devServer?.proxy?.proxyHTTPPaths,
    proxyWSPaths: config?.devServer?.proxy?.proxyWSPaths,
  };

  const devServerConfig = getDevServerConfig({
    port,
    host: devServerHost,
    writeToDisk: options.write,
    isHttps: options.https,
    hot: isHot,
    proxy,
    config,
  });

  const devServer = new WebpackDevServer(devServerConfig, compiler);

  ["SIGINT", "SIGTERM"].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close();
      process.exit();
    });
  });

  process.stdin.on("end", function () {
    devServer.close();
    process.exit();
  });

  await devServer.start();
};
