import type { TWebpackCacheType } from "../../arguments";
import PackageJSON from "../../../package.json";
import type webpack from "webpack";
export const getWebpackCacheConfig = (cacheType: TWebpackCacheType): webpack.Configuration => {
  let cache: webpack.FileCacheOptions | webpack.MemoryCacheOptions | null = null;

  if (cacheType === "fs") {
    cache = {
      type: "filesystem",
      maxMemoryGenerations: 2,
      memoryCacheUnaffected: true,
      version: PackageJSON.version,
    };
  } else {
    cache = {
      type: "memory",
      maxGenerations: 1,
    };
  }

  return {
    cache,
  };
};
