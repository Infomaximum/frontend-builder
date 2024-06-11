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
import { overlay } from "../configs/webpack/overlay";
import { tsChecker } from "../configs/webpack/tsChecker";
import type { TStartOptions } from "../arguments";
import { getBundleAnalyzerConfig } from "../configs/webpack/bundleAnalyzer";
import { circularDependencyDetector } from "../configs/webpack/circularDep";
import { getWebpackCacheConfig } from "../configs/webpack/cache";

export const runDevServer = async (options: TStartOptions) => {
  const PATHS = generatePaths({
    entryPath: options.entry_path,
    outputPath: undefined,
  });

  try {
    await run(PATHS, options);
  } catch (error: any) {
    if (error?.message) {
      console.log(chalk.red(error.message));
    }

    process.exit(1);
  }
};

const run = async (PATHS: TPaths, options: TStartOptions) => {
  const { defaultDevServerPort, devServerHost, appPath } = PATHS;
  let port = defaultDevServerPort;

  try {
    port = (await choosePort(devServerHost, defaultDevServerPort)) ?? defaultDevServerPort;
  } catch (e) {
    console.error(chalk.red(e));

    process.exit(1);
  }

  const mode: TMode = "development";

  const isHot = options.hot;

  const configWebpack = [
    await getCommonConfig(mode, PATHS, isHot),
    getWebpackCacheConfig(options.cache),
    getLoaders(mode, PATHS),
    getHTMLConfig(mode, PATHS),
    options.analyze ? getBundleAnalyzerConfig() : {},
    tsChecker,
    options.overlay ? overlay : {}, // todo: https://github.com/smooth-code/error-overlay-webpack-plugin/issues/67
    options.circular ? circularDependencyDetector : {},
  ];

  const compiler = webpack(merge(configWebpack));

  const devServerConfig = getDevServerConfig({
    PATHS,
    appPath,
    port,
    host: devServerHost,
    proxyPort: options.proxy_port,
    proxyHost: options.proxy_ip,
    writeToDisk: options.write,
    isHttps: options.https,
    hot: isHot,
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
