import RemovePlugin from "remove-files-webpack-plugin";
import { merge } from "webpack-merge";
import { ContextReplacementPlugin, ProvidePlugin } from "webpack";
import type { TMode, TPaths } from "../../paths";
import { getBabelConfig } from "./babel";
import { getStylesWebpackConfig } from "./styles";
import webpack from "webpack";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import { resolvePathFromModule } from "../configFile";

type CommonParams = {
  mode: TMode;
  PATHS: TPaths;
  isHot?: boolean;
  entries: string[] | (() => string[]);
};

export const getCommonWebpackConfig = async ({ mode, PATHS, isHot, entries }: CommonParams) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  const isHMR = isHot && isDev;

  const name = `${PATHS.buildJsPath}/${isProd ? "[name].[contenthash]" : "[name]"}.js`;

  return merge([
    {
      context: PATHS.appPath,
      mode: mode,
      entry: () => [
        require.resolve("core-js"),
        ...(typeof entries === "function" ? entries() : entries).map((p) =>
          resolvePathFromModule(p),
        ),
      ],
      output: {
        path: PATHS.appRelease,
        publicPath: PATHS.publicPath,
        filename: name,
        chunkFilename: name,
        hashFunction: "xxhash64", // ускорение пересборки https://github.com/webpack/webpack/issues/12102#issuecomment-938544497
        assetModuleFilename: `${PATHS.staticPath}/assets/${isProd ? "[name].[contenthash][ext]" : "[id]"}`,
        webassemblyModuleFilename: `${PATHS.wasmPath}/${Math.random()}.wasm`,
      },
      experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        backCompat: false, //убираем слой обратной совместимости с webpack 4 https://github.com/webpack/webpack/issues/14580
        /* 
        todo: ускорение пересборки https://github.com/webpack/webpack/issues/12102#issuecomment-938544497
        лучше включить эту опцию вместо hashFunction и cacheUnaffected, но в данный момент появляются ошибки
        смешанных импортов значений и типов, после перехода на typescript 4.5 вернуться к этому
        */
        //futureDefaults: true,
        cacheUnaffected: true, //ускорение пересборки https://github.com/webpack/webpack/issues/12102#issuecomment-938544497
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
        new webpack.ProgressPlugin(),
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
        new ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
        // удаление всех локализаций из момента кроме указанных
        new ContextReplacementPlugin(/moment[/\\]locale$/, /ru|en/),
        isHMR && new ReactRefreshWebpackPlugin({ overlay: false }),
      ].filter(Boolean),
      devtool: isDev ? "cheap-module-source-map" : false,
      stats: "errors-only",
      watchOptions: {
        ignored: "**/node_modules",
      },
    } as webpack.Configuration,
    getStylesWebpackConfig(mode, PATHS),
  ]);
};
