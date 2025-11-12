import { RspackZipPlugin } from "rspack-zip-plugin";
import type { TPaths } from "../../paths";
import path from "path";
import { getZipBundleName } from "../../utils";

type ZipPluginRspackConfigParams = {
  PATHS: TPaths;
};

export const getZipPluginRspackConfig = ({ PATHS }: ZipPluginRspackConfigParams) => {
  const name = getZipBundleName();

  return {
    plugins: [new RspackZipPlugin({ destPath: path.join(PATHS.appPath, name) })],
  };
};
