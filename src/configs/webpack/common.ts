import RemovePlugin from "remove-files-webpack-plugin";
import { merge } from "webpack-merge";
import WebpackBar from "webpackbar";
import { DefinePlugin, ContextReplacementPlugin, ProvidePlugin } from "webpack";
import type { TMode, TPaths } from "../../paths";
import { getBabelConfig } from "./babel";
import { getStylesConfig } from "./styles";
import type webpack from "webpack";
import { getVersionPackages, getHashLastCommit, getCurrentBranchOrTagName } from "./utils/utils";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
export const getCommonConfig = async (mode: TMode, PATHS: TPaths, isHot?: boolean) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  const isHMR = isHot && isDev;

  const name = `${PATHS.staticPath}/js/${isProd ? "[name].[contenthash]" : "[name]"}.js`;

  const hash = await getHashLastCommit(PATHS);
  const versions = await getVersionPackages(PATHS);
  const branchName = await getCurrentBranchOrTagName(PATHS);

  return merge([
    {
      context: PATHS.appPath,
      mode: mode,
      entry: [require.resolve("core-js"), PATHS.moduleIndex],
      output: {
        path: PATHS.appRelease,
        publicPath: PATHS.publicPath,
        filename: name,
        chunkFilename: name,
        webassemblyModuleFilename: `${PATHS.wasmPath}/${Math.random()}.wasm`,
      },
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        backCompat: false, //убираем слой обратной совместимости с webpack 4 https://github.com/webpack/webpack/issues/14580
        futureDefaults: true,
      },
      cache: {
        type: "memory",
        maxGenerations: 5,
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        fallback: {
          buffer: require.resolve("buffer/"),
          crypto: false,
        },
      },
      module: {
        unsafeCache: true, //ускорение пересборки https://github.com/webpack/webpack/issues/12102#issuecomment-938544497
        rules: [
          {
            test: /\.m?js/,
            exclude: /node_modules/,
            resolve: {
              fullySpecified: false,
            },
          },
          {
            test: /\.[j,t]sx?$/,
            exclude: /node_modules/,
            use: [
              getBabelConfig(isDev, isHMR), //должен быть перед ts-loader
              {
                loader: require.resolve("ts-loader"),
                options: {
                  transpileOnly: true,
                  getCustomTransformers: () => ({
                    before: [isHMR && ReactRefreshTypeScript()].filter(Boolean),
                  }),
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new WebpackBar({ profile: false }),
        new RemovePlugin({
          // всегда очищает только перед первой сборкой
          before: {
            root: PATHS.appRelease,
            include: ["./"],
            allowRootAndOutside: true,
          },
          watch: {
            root: PATHS.appRelease,
            beforeForFirstBuild: true,
            allowRootAndOutside: true,
          },
        }),
        new DefinePlugin({
          "process.env": {
            NODE_ENV: JSON.stringify(mode),
            LAST_COMMIT_HASH: JSON.stringify(hash),
            BUILD_TIME: new Date().valueOf(),
            DEBUG: isDev,
            SHOW_BUILD_INFO: true,
            BUILD_DIR: JSON.stringify(PATHS.appRelease),
            VERSIONS: JSON.stringify(versions),
            BRANCH: JSON.stringify(branchName),
          },
        }),
        new ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
        // удаление всех локализаций из момента кроме указанных
        new ContextReplacementPlugin(/moment[/\\]locale$/, /ru|en/),
        isHMR && new ReactRefreshWebpackPlugin(),
      ].filter(Boolean),
      devtool: isDev ? "cheap-module-source-map" : false,
      stats: "errors-only",
    } as webpack.Configuration,
    getStylesConfig(mode, PATHS),
  ]);
};
