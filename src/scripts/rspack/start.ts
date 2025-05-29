import chalk from "chalk";
import type { TStartOptions } from "../../arguments";
import type { ImBuilderConfig } from "../../configs/configFile";
import { generatePaths, type TMode, type TPaths } from "../../paths";
import { choosePort } from "react-dev-utils/WebpackDevServerUtils";
import { getCommonRspackConfig } from "../../configs/rspack/common";
import { getHTMLRspackConfig } from "../../configs/rspack/htmlConfig";
import { rspack, type RspackOptions } from "@rspack/core";
import { getRspackLoaders } from "../../configs/rspack/loaders";
import { tsCheckerRspackConfig } from "../../configs/rspack/tsChecker";
import { circularDependencyDetectorRspackConfig } from "../../configs/rspack/circularDep";
import merge from "webpack-merge";
import { getDevServerRspackConfig } from "../../configs/rspack/devServer";
import { RspackDevServer } from "@rspack/dev-server";
import { getRsDoctorRspackConfig } from "../../configs/rspack/rsDoctor";

export const runRspackDevServer = async (
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

async function run(PATHS: TPaths, options: TStartOptions, config: ImBuilderConfig | undefined) {
  const devServerHost = "0.0.0.0";

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

  const configRspack = [
    await getCommonRspackConfig({ mode, PATHS, isHot, entries }),
    getRspackLoaders(mode, PATHS),
    getHTMLRspackConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    tsCheckerRspackConfig,
    options.circular ? circularDependencyDetectorRspackConfig : {},
    options.analyze ? getRsDoctorRspackConfig(PATHS) : {},
  ] satisfies RspackOptions[];

  const compiler = rspack(merge(configRspack));

  const proxy = {
    proxyPort: options.proxy_port,
    proxyHost: options.proxy_ip,
  };

  const devServerConfig = getDevServerRspackConfig({
    port,
    host: devServerHost,
    writeToDisk: options.write,
    isHttps: options.https,
    hot: isHot,
    proxy,
    config,
  });

  const devServer = new RspackDevServer(devServerConfig, compiler);

  ["SIGINT", "SIGTERM"].forEach(function (sig) {
    process.on(sig, function () {
      devServer.stop();
      process.exit();
    });
  });

  process.stdin.on("end", function () {
    devServer.stop();
    process.exit();
  });

  await devServer.start();
}
