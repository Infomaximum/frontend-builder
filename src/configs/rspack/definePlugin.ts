import rspack from "@rspack/core";
import type { TMode, TPaths } from "../../paths";
import { getBuildInfo, getVersionPackages, type TBuildInfo } from "../../utils";

type DefinePluginRspackConfigParams = {
  mode: TMode;
  PATHS: TPaths;
  /** Информация о сборке; без нее вычисляется заново */
  buildInfo?: TBuildInfo;
};

export const getDefinePluginRspackConfig = async ({
  mode,
  PATHS,
  buildInfo,
}: DefinePluginRspackConfigParams) => {
  const { hash, build_time, branch } = buildInfo ?? (await getBuildInfo(PATHS));
  const versions = await getVersionPackages(PATHS);

  return {
    plugins: [
      new rspack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify(mode),
          LAST_COMMIT_HASH: JSON.stringify(hash),
          BUILD_TIME: build_time,
          DEBUG: mode === "development",
          SHOW_BUILD_INFO: true,
          BUILD_DIR: JSON.stringify(PATHS.appRelease),
          VERSIONS: JSON.stringify(versions),
          BRANCH: JSON.stringify(branch),
        },
      }),
    ],
  };
};
