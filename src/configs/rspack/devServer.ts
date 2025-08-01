import monitor from "express-status-monitor";
import type { ImBuilderConfig } from "../configFile";
import { rspack, type DevServer } from "@rspack/core";
import { choosePort } from "react-dev-utils/WebpackDevServerUtils";
import chalk from "chalk";

type ProxyConfig = {
  proxyPort: string | undefined;
  proxyHost: string | undefined;
};

type TDevServerConfigParams = {
  writeToDisk: boolean;
  isHttps: boolean;
  hot: boolean;
  proxy: ProxyConfig;
  config: ImBuilderConfig | undefined;
};

export const getDevServerRspackConfig = async ({
  proxy,
  writeToDisk,
  isHttps,
  hot,
  config,
}: TDevServerConfigParams): Promise<DevServer> => {
  const { proxyHost, proxyPort } = proxy;

  const devServerHost = "0.0.0.0";

  let port = config?.devServer?.defaultPort;

  const defaultPort = config?.devServer?.defaultPort ?? 3000;

  try {
    port = (await choosePort(devServerHost, defaultPort)) ?? defaultPort;
  } catch (e) {
    console.error(chalk.red(e));

    process.exit(1);
  }

  const secure = isHttps ? "s" : "";

  const ph = proxyHost ?? config?.devServer?.proxy?.host ?? "localhost";
  const pp = proxyPort ?? config?.devServer?.proxy?.port ?? 8091;

  const target = `${secure}://${ph}${`:${pp}`}`;

  return {
    port,
    host: devServerHost,
    compress: true,
    hot: !!hot,
    client: hot
      ? {
          overlay: false,
          logging: "error",
        }
      : false,
    historyApiFallback: { disableDotRule: true },
    setupExitSignals: true,
    devMiddleware: {
      writeToDisk,
      stats: "errors-only",
    },
    webSocketServer: {
      type: "ws",
      options: {
        path: "/dev-ws-server",
      },
    },
    proxy: [
      {
        context: config?.devServer?.proxy?.proxyHTTPPaths,
        target: `http${target}`,
        secure: !!secure,
        changeOrigin: true,
      },
      {
        context: config?.devServer?.proxy?.proxyWSPaths,
        target: `ws${target}`,
        ws: true,
        logLevel: "silent",
        secure: !!secure,
        changeOrigin: true,
      },
    ],
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      devServer.app?.use(
        monitor({
          title: `Dev Server Status (rspack v${rspack.rspackVersion}, webpack v${rspack.version})`,
          path: "/status",
          chartVisibility: {
            cpu: true,
            mem: true,
            load: true,
            heap: true,
            responseTime: false,
            rps: false,
            statusCodes: false,
          },
          healthChecks:
            proxyPort && proxyHost
              ? [
                  {
                    protocol: `http${secure}`,
                    path: `/graphql?query={server{status}}`,
                    host: proxyHost,
                    port: proxyPort,
                  },
                ]
              : undefined,
        }),
      );

      if (typeof config?.devServer?.customMiddlewares === "function") {
        const result = config.devServer.customMiddlewares(
          middlewares,
          devServer,
        ) as typeof middlewares;

        return result ? result : middlewares;
      }

      return middlewares;
    },
  } satisfies DevServer;
};
