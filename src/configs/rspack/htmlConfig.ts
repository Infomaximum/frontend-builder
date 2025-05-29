import HtmlRspackPlugin from "html-rspack-plugin";
import type { TMode, TPaths } from "../../paths";
import fs from "fs";
import chalk from "chalk";

type HTMLConfigParams = {
  pugFilePath: string | undefined;
  mode: TMode;
  PATHS: TPaths;
};

export const getHTMLRspackConfig = ({ mode, PATHS, pugFilePath }: HTMLConfigParams) => {
  if (!pugFilePath || !fs.existsSync(pugFilePath)) {
    console.log(chalk.bold.red("Не найден index.pug"));
    return {};
  }

  return {
    plugins: [
      new HtmlRspackPlugin({
        filename: "index.html",
        inject: false,
        template: pugFilePath,

        buildDir: PATHS.appRelease,
        staticPath: `${PATHS.publicPath}${PATHS.staticPath}`,
        faviconPath: `${PATHS.publicPath}favicon.ico`,
        imagePath: `${PATHS.publicPath}${PATHS.imagePath}`,
        fontsPath: `${PATHS.publicPath}${PATHS.fontsPath}`,
      }),
    ],
  };
};
