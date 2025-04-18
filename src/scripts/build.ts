import chalk from "chalk";
import webpack, { Stats } from "webpack";
import { merge } from "webpack-merge";
import printBuildError from "react-dev-utils/printBuildError";
import { getCommonConfig } from "../configs/webpack/common";
import { duplicateConfig } from "../configs/webpack/duplicatePackage";
import { getHTMLConfig } from "../configs/webpack/htmlConfig";
import { getLoaders } from "../configs/webpack/loaders";
import { minimizerConfig } from "../configs/webpack/minimizer";
import { generatePaths, type TMode } from "../paths";
import type { TBuildOptions } from "../arguments";
import { getBundleAnalyzerConfig } from "../configs/webpack/bundleAnalyzer";
import { getProgressBuildConfig } from "../configs/webpack/progressBuild";
import { tsChecker } from "../configs/webpack/tsChecker";
import type { ImBuilderConfig } from "../configs/configFile";

export const runBuild = async (args: TBuildOptions, config: ImBuilderConfig | undefined) => {
  const mode: TMode = "production";

  const PATHS = generatePaths({
    outputPath: config?.outputPath ?? args?.output_path,
  });

  const entries = config?.entries ?? [PATHS.moduleIndex];

  const configList = [
    await getCommonConfig({ mode, PATHS, entries }),
    getLoaders(mode, PATHS),
    getHTMLConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    minimizerConfig,
    duplicateConfig,
    tsChecker,
  ] as webpack.Configuration[];

  args?.analyze && configList.push(getBundleAnalyzerConfig());
  // могут быть проблемы (шрифты, картинки и др.ресурсы не  копируются при повторном билде)
  args?.watch && configList.push({ watch: true }, getProgressBuildConfig(PATHS));
  args?.source_map && configList.push({ devtool: "source_map" });

  const webpackConfig = merge(configList);

  try {
    build(webpackConfig);
  } catch (error: any) {
    console.log(chalk.red("Failed to compile.\n"));
    printBuildError(error);
    process.exit(1);
  }
};

function build(config: webpack.Configuration) {
  const compiler = webpack(config);

  const getHandler = (callback: (err?: Error | null, stats?: Stats) => void) =>
    config.watch ? compiler.watch({}, callback) : compiler.run(callback);

  return getHandler((err: any, stats) => {
    if (err) {
      console.error(err.stack || err);

      if (err?.details) {
        console.error(err.details);
      }

      return;
    }

    stats &&
      console.log(
        stats?.toString({
          chunks: false,
          colors: true,
        }),
      );
  });
}
