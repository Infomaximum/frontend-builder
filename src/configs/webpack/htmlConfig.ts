import HtmlWebpackPlugin from "html-webpack-plugin";
import type { TMode, TPaths } from "../../paths";
import fs from "fs";
import chalk from "chalk";

export const getHTMLConfig = (mode: TMode, PATHS: TPaths) => {
  const isProd = mode === "production";

  if (!fs.existsSync(PATHS.appPug)) {
    console.log(chalk.bold.red("Не найден index.pug"));
    return {};
  }

  const productionOptions = {
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  };

  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: false,
        template: `!!pug-loader!${PATHS.appPug}`,

        buildDir: PATHS.appRelease,
        staticPath: `${PATHS.publicPath}${PATHS.staticPath}`,
        faviconPath: `${PATHS.publicPath}favicon.ico`,
        imagePath: `${PATHS.publicPath}${PATHS.imagePath}`,
        fontsPath: `${PATHS.publicPath}${PATHS.fontsPath}`,

        ...(isProd ? productionOptions : {}),
      }),
    ],
  };
};
