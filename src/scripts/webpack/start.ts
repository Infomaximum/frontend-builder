import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { generatePaths, type TMode, type TPaths } from "../../paths";
import { merge } from "webpack-merge";
import { getDevServerWebpackConfig } from "../../configs/webpack/devServer";
import chalk from "chalk";
import { getCommonWebpackConfig } from "../../configs/webpack/common";
import { getWebpackLoaders } from "../../configs/webpack/loaders";
import { getHTMLWebpackConfig } from "../../configs/webpack/htmlConfig";
import { tsCheckerWebpackConfig } from "../../configs/webpack/tsChecker";
import type { TStartOptions } from "../../arguments";
import { getBundleAnalyzerConfig } from "../../configs/webpack/bundleAnalyzer";
import { circularDependencyDetector } from "../../configs/webpack/circularDep";
import { getWebpackCacheConfig } from "../../configs/webpack/cache";
import type { ImBuilderConfig } from "../../configs/configFile";
import { getDefinePluginWebpackConfig } from "../../configs/webpack/definePlugin";
import { compact } from "lodash";

export const runWebpackDevServer = async (
  options: TStartOptions,
  config: ImBuilderConfig | undefined,
) => {
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
  const mode: TMode = "development";

  const isHot = options.hot;

  const entries = config?.entries ?? [PATHS.moduleIndex];

  const configWebpack = compact([
    await getCommonWebpackConfig({ mode, PATHS, isHot, entries }),
    getWebpackCacheConfig(options.cache),
    getWebpackLoaders(mode, PATHS),
    getHTMLWebpackConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    await getDefinePluginWebpackConfig({ mode, PATHS }),
    options.analyze ? getBundleAnalyzerConfig() : {},
    options.tsCheck && tsCheckerWebpackConfig,
    options.circular ? circularDependencyDetector : {},
  ]);

  const compiler = webpack(merge(configWebpack));

  const proxy = {
    proxyPort: options.proxy_port,
    proxyHost: options.proxy_ip,
  };

  const devServerConfig = await getDevServerWebpackConfig({
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
