import { RspackZipPlugin } from "rspack-zip-plugin";
import type { TPaths } from "../../paths";
import path from "path";
import { getZipBundleName } from "../../utils";

type ZipPluginRspackConfigParams = {
  PATHS: TPaths;
  name: string | boolean;
};

export const getZipPluginRspackConfig = ({ name, PATHS }: ZipPluginRspackConfigParams) => {
  const defaultName = getZipBundleName();

  const archiveName = typeof name === "string" ? `${name}.zip` : defaultName;

  return {
    plugins: [new RspackZipPlugin({ destPath: path.join(PATHS.appPath, archiveName) })],
  };
};
