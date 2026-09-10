import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { TProxyOptions } from "../arguments";
import { generatePaths } from "../paths";
import compression from "compression";
import type { ImBuilderConfig } from "../configs/configFile";
import { createProxyErrorHandler, resolveProxyTarget } from "../configs/proxy";

export const runProxy = (options: TProxyOptions, config: ImBuilderConfig | undefined) => {
  const { port, proxy_host, https, proxy_port, debug, secure } = options;

  const target = resolveProxyTarget({
    host: proxy_host,
    port: proxy_port,
    isHttps: https,
    secure,
    configProxy: config?.devServer?.proxy,
  });

  const onProxyError = createProxyErrorHandler(target);

  const app = express();

  const PATHS = generatePaths();

  app.use(compression());
  app.use(express.static(PATHS.appRelease));

  config?.devServer?.proxy?.proxyHTTPPaths?.forEach((proxyPath) => {
    app.use(
      proxyPath,
      createProxyMiddleware({
        target: `${target.httpTarget}${proxyPath}`,
        changeOrigin: true,
        pathRewrite: {
          [`^${proxyPath}`]: "",
        },
        secure: target.secure,
        onError: onProxyError,
        onProxyReq: (proxyReq, req, res) => {
          debug && console.log(`[ProxyReq] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          debug &&
            console.log(
              `[ProxyRes] ${req.method} ${req.originalUrl} -> Response: ${proxyRes.statusCode}`,
            );
        },
      }),
    );
  });

  config?.devServer?.proxy?.proxyWSPaths?.forEach((proxyPath) => {
    app.use(
      proxyPath,
      createProxyMiddleware({
        target: target.wsTarget,
        ws: true,
        logLevel: "silent",
        secure: target.secure,
        changeOrigin: true,
        onError: onProxyError,
        onProxyReqWs: (proxyReq, req, res) => {
          debug && console.log(`[ProxyReqWS] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          debug &&
            console.log(
              `[ProxyResWS] ${req.method} ${req.originalUrl} -> Response: ${proxyRes.statusCode}`,
            );
        },
      }),
    );
  });

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(PATHS.appRelease, "index.html"));
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};
