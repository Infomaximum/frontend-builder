import ZipPlugin from "zip-webpack-plugin";
import type webpack from "webpack";
import { getZipBundleName } from "../../utils";
import type { TPaths } from "../../paths";

type ZipPluginWebpackConfigParams = {
  PATHS: TPaths;
  name: string | boolean;
};

export const getZipPluginWebpackConfig = ({ name, PATHS }: ZipPluginWebpackConfigParams) => {
  const defaultName = getZipBundleName();

  const archiveName = typeof name === "string" ? `${name}.zip` : defaultName;

  return {
    plugins: [
      new ZipPlugin({
        path: PATHS.appPath,
        filename: archiveName,
      }),
    ],
  } as webpack.Configuration;
};
