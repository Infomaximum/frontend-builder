import type WebpackDevServer from "webpack-dev-server";
import monitor from "express-status-monitor";
import webpack from "webpack";
import fs from "fs-extra";
import path from "path";
import type { TPaths } from "../../paths";

type TDevServerConfigParams = {
  appPath: string;
  port: number;
  host: string;
  proxyPort: string | undefined;
  proxyHost: string;
  writeToDisk: boolean;
  isHttps: boolean;
  PATHS: TPaths;
  hot: boolean;
};

export const getDevServerConfig = ({
  appPath,
  port,
  host,
  proxyPort,
  proxyHost,
  writeToDisk,
  isHttps,
  PATHS,
  hot,
}: TDevServerConfigParams): WebpackDevServer.Configuration => {
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
        context: ["/graphiql", "/static", "/graphql", "/ad_auth", "/saml_auth"],
        target: `http${target}`,
        secure: !!secure,
        changeOrigin: true,
      },
      {
        context: ["/ws"],
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

      const isModulesFile = () => fs.existsSync(path.resolve(appPath, "modules.json"));

      if (isModulesFile()) {
        devServer.app?.get("/gen", (req, res) => {
          if (isModulesFile()) {
            res.contentType("application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");

            const readable = fs.createReadStream(path.resolve(appPath, "modules.json"), {
              encoding: "utf-8",
            });

            readable.pipe(res);
          } else {
            res.status(500);

            res.send("Не найден файл modules.json");
          }
        });

        devServer.app?.get("/generator", (req, res) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.sendFile(path.resolve(PATHS.assetsPath, "generator.html"));
        });
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

      return middlewares;
    },
  };
};
