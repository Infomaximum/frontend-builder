import ZipPlugin from "zip-webpack-plugin";
import type webpack from "webpack";
import { getZipBundleName } from "../../utils";
import type { TPaths } from "../../paths";

type ZipPluginWebpackConfigParams = {
  PATHS: TPaths;
};

export const getZipPluginWebpackConfig = ({ PATHS }: ZipPluginWebpackConfigParams) => {
  const name = getZipBundleName();

  return {
    plugins: [
      new ZipPlugin({
        path: PATHS.appPath,
        filename: name,
      }),
    ],
  } as webpack.Configuration;
};
