import type { TBuildOptions } from "../../arguments";
import type { ImBuilderConfig } from "../../configs/configFile";
import { getCommonRspackConfig } from "../../configs/rspack/common";
import { getHTMLRspackConfig } from "../../configs/rspack/htmlConfig";
import { getRspackLoaders } from "../../configs/rspack/loaders";
import { generatePaths, type TMode } from "../../paths";
import { rspack, type RspackOptions, type Stats } from "@rspack/core";
import { getRsDoctorRspackConfig } from "../../configs/rspack/rsDoctor";
import merge from "webpack-merge";
import chalk from "chalk";
import printBuildError from "react-dev-utils/printBuildError";
import { minimizerRspackConfig } from "../../configs/rspack/minimizer";
import { tsCheckerRspackConfig } from "../../configs/rspack/tsChecker";
import { getDefinePluginRspackConfig } from "../../configs/rspack/definePlugin";
import { compact } from "lodash";
import { getZipPluginRspackConfig } from "../../configs/rspack/zip";

export const runRspackBuild = async (args: TBuildOptions, config: ImBuilderConfig | undefined) => {
  const mode: TMode = "production";

  const PATHS = generatePaths({
    outputPath: config?.outputPath ?? args?.output_path,
  });

  const entries = config?.entries ?? [PATHS.moduleIndex];

  const configList = compact([
    await getCommonRspackConfig({ mode, PATHS, entries }),
    getRspackLoaders(mode, PATHS),
    getHTMLRspackConfig({ mode, PATHS, pugFilePath: config?.pugFilePath }),
    await getDefinePluginRspackConfig({ mode, PATHS }),
    minimizerRspackConfig,
    args.tsCheck && tsCheckerRspackConfig,
    args.zip && getZipPluginRspackConfig({ name: args.zip, PATHS }),
  ]) as RspackOptions[];

  args?.analyze && configList.push(getRsDoctorRspackConfig(PATHS));
  // могут быть проблемы (шрифты, картинки и др.ресурсы не  копируются при повторном билде)
  args?.watch && configList.push({ watch: true });
  args?.source_map && configList.push({ devtool: "source-map" });

  const rspackConfig = merge(configList);

  try {
    build(rspackConfig);
  } catch (error: any) {
    console.log(chalk.red("Failed to compile.\n"));
    printBuildError(error);
    process.exit(1);
  }
};

function build(config: RspackOptions) {
  const compiler = rspack(config);

  const getHandler = (callback: (err?: Error | null, stats?: Stats) => void) =>
    config.watch ? compiler.watch({}, callback) : compiler.run(callback);

  return getHandler((err: any, stats) => {
    if (err) {
      console.error(err.stack || err);

      if (err.details) {
        console.error(err.details);
      }

      process.exit(1);

      return;
    }

    if (stats && stats.hasErrors()) {
      console.error(stats.toString({ colors: true }));
      process.exit(1);
    }

    if (stats && stats.hasWarnings()) {
      console.warn(stats.toString({ colors: true }));
    }
  });
}
