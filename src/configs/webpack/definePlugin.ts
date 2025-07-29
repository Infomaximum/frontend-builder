import type { TMode, TPaths } from "../../paths";
import { getCurrentBranchOrTagName, getHashLastCommit, getVersionPackages } from "../../utils";
import { DefinePlugin } from "webpack";

type DefinePluginWebpackConfigParams = {
  mode: TMode;
  PATHS: TPaths;
};

export const getDefinePluginWebpackConfig = async ({
  mode,
  PATHS,
}: DefinePluginWebpackConfigParams) => {
  let hash: string = "";

  try {
    hash = (await getHashLastCommit(PATHS)) || "";
  } catch (error) {}

  const versions = await getVersionPackages(PATHS);
  const branchName = await getCurrentBranchOrTagName(PATHS);

  return {
    plugins: [
      new DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify(mode),
          LAST_COMMIT_HASH: JSON.stringify(hash),
          BUILD_TIME: new Date().valueOf(),
          DEBUG: mode === "development",
          SHOW_BUILD_INFO: true,
          BUILD_DIR: JSON.stringify(PATHS.appRelease),
          VERSIONS: JSON.stringify(versions),
          BRANCH: JSON.stringify(branchName),
        },
      }),
    ],
  };
};
