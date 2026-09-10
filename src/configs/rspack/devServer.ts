import monitor from "express-status-monitor";
import type { ImBuilderConfig } from "../configFile";
import { rspack, type DevServer } from "@rspack/core";
import { createProxyErrorHandler, resolveProxyTarget } from "../proxy";
import { choosePort } from "react-dev-utils/WebpackDevServerUtils";
import chalk from "chalk";

type ProxyConfig = {
  proxyPort: string | undefined;
  proxyHost: string | undefined;
  secure: boolean | undefined;
};

type TDevServerConfigParams = {
  writeToDisk: boolean;
  isHttps: boolean;
  hot: boolean;
  port?: string;
  proxy: ProxyConfig;
  config: ImBuilderConfig | undefined;
};

export const getDevServerRspackConfig = async ({
  proxy,
  writeToDisk,
  isHttps,
  hot,
  port: cliPort,
  config,
}: TDevServerConfigParams): Promise<DevServer> => {
  const { proxyHost, proxyPort, secure } = proxy;

  const devServerHost = "0.0.0.0";

  const defaultPort =
    (cliPort ? parseInt(cliPort, 10) : undefined) ?? config?.devServer?.defaultPort ?? 3000;

  let port: number | undefined = defaultPort;

  try {
    port = (await choosePort(devServerHost, defaultPort)) ?? defaultPort;
  } catch (e) {
    console.error(chalk.red(e));

    process.exit(1);
  }

  const target = resolveProxyTarget({
    host: proxyHost,
    port: proxyPort,
    isHttps,
    secure,
    configProxy: config?.devServer?.proxy,
    defaultPort: 8091,
  });

  const onProxyError = createProxyErrorHandler(target);

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
        target: target.httpTarget,
        secure: target.secure,
        changeOrigin: true,
        onError: onProxyError,
      },
      {
        context: config?.devServer?.proxy?.proxyWSPaths,
        target: target.wsTarget,
        ws: true,
        logLevel: "silent",
        secure: target.secure,
        changeOrigin: true,
        onError: onProxyError,
      },
    ],
    allowedHosts: config?.devServer?.allowedHosts,
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
            proxyHost && target.port !== undefined
              ? [
                  {
                    protocol: `http${target.isHttps ? "s" : ""}`,
                    path: `/graphql?query={server{status}}`,
                    host: target.host,
                    port: target.port,
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
