import type WebpackDevServer from "webpack-dev-server";
import monitor from "express-status-monitor";
import webpack from "webpack";
import type { ImBuilderConfig } from "../configFile";

type ProxyConfig = {
  proxyPort: string | undefined;
  proxyHost: string;
};

type TDevServerConfigParams = {
  port: number;
  host: string;
  writeToDisk: boolean;
  isHttps: boolean;
  hot: boolean;
  proxy: ProxyConfig;
  config: ImBuilderConfig | undefined;
};

export const getDevServerConfig = ({
  port,
  host,
  proxy,
  writeToDisk,
  isHttps,
  hot,
  config,
}: TDevServerConfigParams): WebpackDevServer.Configuration => {
  const { proxyHost, proxyPort } = proxy;

  const secure = isHttps ? "s" : "";

  const target = `${secure}://${proxyHost}${proxyPort ? `:${proxyPort}` : ""}`;

  return {
    port,
    host,
    compress: true,
    hot: !!hot,
    client: hot
      ? {
          overlay: false,
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
          title: `Dev Server Status (webpack v${webpack.version})`,
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
          healthChecks: proxyPort
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
        const result = config.devServer.customMiddlewares(middlewares, devServer);

        return result ? result : middlewares;
      }

      return middlewares;
    },
  };
};
