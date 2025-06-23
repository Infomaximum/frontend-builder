import merge from "webpack-merge";
import RemovePlugin from "remove-files-webpack-plugin";
import type { TMode, TPaths } from "../../paths";
import { getCurrentBranchOrTagName, getHashLastCommit, getVersionPackages } from "../../utils";
import { resolvePathFromModule } from "../configFile";
import { rspack, type RspackOptions, type SwcLoaderOptions } from "@rspack/core";
import path from "path";
import ReactRefreshPlugin from "@rspack/plugin-react-refresh";
import { getStylesRspackConfig } from "./styles";
import packageJson from "../../../package.json";
type CommonParams = {
  mode: TMode;
  PATHS: TPaths;
  isHot?: boolean;
  entries: string[] | (() => string[]);
};

export const getCommonRspackConfig = async ({ mode, PATHS, isHot, entries }: CommonParams) => {
  const isDev = mode === "development";
  const isProd = mode === "production";
  const isHMR = !!(isHot && isDev);

  const name = `${PATHS.buildJsPath}/${isProd ? "[name].[contenthash]" : "[name]"}.js`;

  let hash: string = "";

  try {
    hash = (await getHashLastCommit(PATHS)) || "";
  } catch (error) {}

  const versions = await getVersionPackages(PATHS);
  const branchName = await getCurrentBranchOrTagName(PATHS);

  return merge([
    {
      mode,
      context: PATHS.appPath,
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
        assetModuleFilename: `${PATHS.staticPath}/assets/${isProd ? "[name].[contenthash][ext]" : "[id]"}`,
        webassemblyModuleFilename: `${PATHS.wasmPath}/${Math.random()}.wasm`,
      },
      experiments: {
        asyncWebAssembly: true,
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        tsConfig: PATHS.appTsConfig,
        fallback: {
          buffer: require.resolve("buffer/"),
          crypto: false,
        },
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: [/node_modules/],
            loader: "builtin:swc-loader",
            options: {
              env: {
                coreJs: packageJson.dependencies["core-js"],
                mode: "entry",
              },
              jsc: {
                parser: {
                  syntax: "typescript",
                  decorators: true,
                  tsx: true,
                },
                transform: {
                  decoratorVersion: "2022-03",
                  react: {
                    runtime: "automatic",
                    importSource: "@emotion/react",
                    development: isDev,
                    refresh: isHMR,
                  },
                },

                experimental: {
                  plugins: [[require.resolve("@swc/plugin-emotion"), {}]],
                  cacheRoot: path.join(PATHS.appNodeModules, ".cache", "swc"),
                },
              },
            } satisfies SwcLoaderOptions,
            type: "javascript/auto",
          },
        ],
      },

      plugins: [
        new rspack.ProgressPlugin({
          template:
            "[{elapsed}] {prefix:.bold} {bar:30.green/white.dim} ({percent}%) \n{wide_msg:.dim}",
        }),
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
        new rspack.DefinePlugin({
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
        new rspack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
        isHMR && new ReactRefreshPlugin({ overlay: false }),
        isHMR && new rspack.HotModuleReplacementPlugin(),
        // удаление всех локализаций из момента кроме указанных
        new rspack.ContextReplacementPlugin(/moment[/\\]locale$/, /ru|en/),
      ],
      devtool: isDev ? "cheap-module-source-map" : false,
    } satisfies RspackOptions,
    getStylesRspackConfig(mode, PATHS),
  ] satisfies RspackOptions[]);
};
