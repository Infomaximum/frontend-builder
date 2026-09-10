import chalk from "chalk";
import type { IncomingMessage, ServerResponse } from "http";
import type { Socket } from "net";

/** Схема, указанная в начале адреса проксирования */
const PROTOCOL_REGEXP = /^([a-z][a-z\d+.-]*):\/\//i;

/** Схемы, для которых проксирование идет поверх TLS */
const SECURE_PROTOCOLS = ["https", "wss"];
const INSECURE_PROTOCOLS = ["http", "ws"];

const DEFAULT_PROXY_HOST = "localhost";

/** Параметры проксирования из imbuilder.config */
export type TProxyConfigParams = {
  host?: string | undefined;
  port?: number | undefined;
  secure?: boolean | undefined;
};

export type TResolveProxyTargetParams = {
  /**
   * Хост из CLI (-ph/--proxy_host). Может быть указан со схемой и портом,
   * например "https://example.com:8091"
   */
  host: string | undefined;
  /** Порт из CLI (-pp/--proxy_port) */
  port: string | undefined;
  /** Флаг -s/--https. Учитывается, только если схема не указана в хосте */
  isHttps: boolean;
  /** Флаг --secure/--no-secure. Приоритетнее значения из конфига */
  secure: boolean | undefined;
  /** Параметры проксирования из imbuilder.config */
  configProxy: TProxyConfigParams | undefined;
  /** Порт, если он не указан ни в хосте, ни в CLI, ни в конфиге */
  defaultPort?: number | undefined;
};

export type TProxyTarget = {
  /** Проксирование идет на https/wss хост */
  isHttps: boolean;
  host: string;
  port: number | undefined;
  /** Адрес для проксирования http запросов */
  httpTarget: string;
  /** Адрес для проксирования websocket запросов */
  wsTarget: string;
  /**
   * Проверять ли SSL сертификат хоста. В http-proxy этот параметр напрямую
   * управляет rejectUnauthorized, поэтому с самоподписанным сертификатом
   * проксирование нужно запускать с --no-secure
   */
  secure: boolean;
};

/**
 * Собирает адреса проксирования из параметров CLI и imbuilder.config.
 *
 * Схема берется из хоста, если она в нем указана, иначе из флага -s/--https.
 * Порт берется из хоста, если он в нем указан, иначе из -pp/--proxy_port,
 * иначе из конфига, иначе из defaultPort.
 */
export const resolveProxyTarget = ({
  host,
  port,
  isHttps,
  secure,
  configProxy,
  defaultPort,
}: TResolveProxyTargetParams): TProxyTarget => {
  const rawHost = host ?? configProxy?.host ?? DEFAULT_PROXY_HOST;

  const parsed = parseProxyHost(rawHost, isHttps);

  const resolvedPort =
    parsed.port ??
    (port !== undefined ? parseProxyPort(port) : undefined) ??
    configProxy?.port ??
    defaultPort;

  const isSecureProtocol = SECURE_PROTOCOLS.includes(parsed.protocol);

  const origin = `${parsed.host}${resolvedPort !== undefined ? `:${resolvedPort}` : ""}`;
  const secureSuffix = isSecureProtocol ? "s" : "";

  return {
    isHttps: isSecureProtocol,
    host: parsed.host,
    port: resolvedPort,
    httpTarget: `http${secureSuffix}://${origin}`,
    wsTarget: `ws${secureSuffix}://${origin}`,
    secure: secure ?? configProxy?.secure ?? isSecureProtocol,
  };
};

function parseProxyHost(rawHost: string, isHttps: boolean) {
  const protocol = PROTOCOL_REGEXP.exec(rawHost)?.[1]?.toLowerCase();

  if (protocol && ![...SECURE_PROTOCOLS, ...INSECURE_PROTOCOLS].includes(protocol)) {
    throw new Error(
      `Недопустимая схема "${protocol}" в адресе проксирования "${rawHost}". ` +
        `Ожидается одна из: ${[...INSECURE_PROTOCOLS, ...SECURE_PROTOCOLS].join(", ")}`,
    );
  }

  // без схемы new URL разберет "example.com:8091" как протокол "example.com",
  // поэтому схему подставляем сами из флага -s/--https
  const url = protocol ? rawHost : `http${isHttps ? "s" : ""}://${rawHost}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Не удалось разобрать адрес проксирования "${rawHost}"`);
  }

  if (!parsedUrl.hostname) {
    throw new Error(`В адресе проксирования "${rawHost}" не указан хост`);
  }

  return {
    protocol: parsedUrl.protocol.slice(0, -1),
    // hostname сохраняет квадратные скобки у ipv6 адресов, они нужны в URL
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : undefined,
  };
}

function parseProxyPort(rawPort: string) {
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Недопустимый порт проксирования "${rawPort}"`);
  }

  return port;
}

/** Коды ошибок проверки SSL сертификата хоста, на который идет проксирование */
const TLS_ERROR_CODES = [
  "CERT_HAS_EXPIRED",
  "CERT_NOT_YET_VALID",
  "CERT_SIGNATURE_FAILURE",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
];

/**
 * По умолчанию http-proxy-middleware отвечает на ошибку проксирования 500 без причины,
 * из-за чего невалидный сертификат хоста выглядит как неработающий бэкенд.
 */
export const createProxyErrorHandler =
  (target: TProxyTarget) =>
  (error: NodeJS.ErrnoException, _req: IncomingMessage, res: ServerResponse | Socket) => {
    const isTLSError = !!error.code && TLS_ERROR_CODES.includes(error.code);

    const message = isTLSError
      ? `SSL сертификат хоста ${target.httpTarget} не прошел проверку (${error.code}). ` +
        `Отключить проверку: флаг --no-secure или devServer.proxy.secure: false в imbuilder.config`
      : `Ошибка проксирования на ${target.httpTarget}: ${error.code ?? error.message}`;

    console.error(chalk.red(message));

    // при ошибке проксирования websocket вместо ответа приходит сокет
    if (!("writeHead" in res)) {
      res.destroy();

      return;
    }

    if (!res.headersSent) {
      res.writeHead(isTLSError ? 502 : 500, { "content-type": "text/plain; charset=utf-8" });
    }

    res.end(message);
  };
