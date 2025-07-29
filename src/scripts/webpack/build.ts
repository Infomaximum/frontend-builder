import chalk from "chalk";
import webpack, { Stats } from "webpack";
import { merge } from "webpack-merge";
import printBuildError from "react-dev-utils/printBuildError";
import { getCommonWebpackConfig } from "../../configs/webpack/common";
import { duplicateConfig } from "../../configs/webpack/duplicatePackage";
import { getHTMLWebpackConfig } from "../../configs/webpack/htmlConfig";
import { getWebpackLoaders } from "../../configs/webpack/loaders";
import { minimizerWebpackConfig } from "../../configs/webpack/minimizer";
import { generatePaths, type TMode } from "../../paths";
import type { TBuildOptions } from "../../arguments";
import { getBundleAnalyzerConfig } from "../../configs/webpack/bundleAnalyzer";
import { getProgressBuildWebpackConfig } from "../../configs/webpack/progressBuild";
import { tsCheckerWebpackConfig } from "../../configs/webpack/tsChecker";
import type { ImBuilderConfig } from "../../configs/configFile";
import { getDefinePluginWebpackConfig } from "../../configs/webpack/definePlugin";
import { compact } from "lodash";

export const runWebpackBuild = async (args: TBuildOptions, config: ImBuilderConfig | undefined) => {
  const mode: TMode = "production";

  const PATHS = generatePaths({
    outputPath: config?.outputPath ?? args?.output_path,
  });

  const entries = config?.entries ?? [PATHS.moduleIndex];

  const configList = compact([
    await getCommonWebpackConfig({ mode, PATHS, entries }),
    getWebpackLoaders(mode, PATHS),
    getHTMLWebpackConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    await getDefinePluginWebpackConfig({ mode, PATHS }),
    minimizerWebpackConfig,
    duplicateConfig,
    args.tsCheck && tsCheckerWebpackConfig,
  ]) as webpack.Configuration[];

  args?.analyze && configList.push(getBundleAnalyzerConfig());
  // могут быть проблемы (шрифты, картинки и др.ресурсы не  копируются при повторном билде)
  args?.watch && configList.push({ watch: true }, getProgressBuildWebpackConfig(PATHS));
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
