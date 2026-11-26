import type { TBuildInfo } from "../utils";

export const BUILD_INFO_FILE_NAME = "build-info.json";

/** Содержимое build-info.json: только эти четыре поля, в этом порядке */
export const serializeBuildInfo = ({ version, build_time, hash, branch }: TBuildInfo) =>
  `${JSON.stringify({ version, build_time, hash, branch }, null, 2)}\n`;
