import { RspackZipPlugin } from "rspack-zip-plugin";
import type { TPaths } from "../../paths";
import path from "path";

type ZipPluginRspackConfigParams = {
  PATHS: TPaths;
};

export const getZipPluginRspackConfig = ({ PATHS }: ZipPluginRspackConfigParams) => {
  const now = new Date();

  const pad = (num: number) => num.toString().padStart(2, "0");

  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = pad(now.getFullYear());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  const formatted = `${day}-${month}-${year}_${hours}-${minutes}`;

  return {
    plugins: [
      new RspackZipPlugin({ destPath: path.join(PATHS.appPath, `release_${formatted}.zip`) }),
    ],
  };
};
