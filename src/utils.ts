import fs from "fs/promises";
import { set, trim } from "lodash";
import path from "path";
import simpleGit from "simple-git";
import type { TPaths } from "./paths";

function isObject(value: any): value is Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function deepMerge(base: any, override: any): any {
  if (Array.isArray(base) && Array.isArray(override)) {
    return override;
  }

  if (isObject(base) && isObject(override)) {
    const result: Record<string, any> = { ...base };

    for (const key of Object.keys(override)) {
      result[key] = deepMerge(base[key], override[key]);
    }

    return result;
  }

  return override !== undefined ? override : base;
}

/** Проверка на то, что папка или файл существуют */
export const isExist = async (entityPath: string) => {
  try {
    await fs.access(entityPath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Возвращает хеш последнего коммита в ветке
 */
export const getHashLastCommit = async (PATHS: TPaths) => {
  const git = simpleGit(PATHS.appPath);

  const data = await git.raw("rev-parse", "HEAD");
  const hash = data ? data.slice(0, 8) : undefined;

  return hash;
};

/** Возвращает имя текущей ветки */
export const getCurrentBranchOrTagName = async (PATHS: TPaths) => {
  const git = simpleGit(PATHS.appPath);

  // имя ветки, git branch --show-current вернет хеш
  const rawBranchName = git.raw("name-rev", "--name-only", "HEAD", "--always");

  const branchName = trim((await rawBranchName).split("~")[0]) ?? "none";

  return branchName;
};

/** Тег выпуска: v и шесть цифр, например v260806 */
const RELEASE_TAG_REGEXP = /^v(\d{6})$/;

const parseReleaseVersion = (tag: string | undefined) =>
  tag?.trim().match(RELEASE_TAG_REGEXP)?.[1] ?? null;

/**
 * Возвращает номер выпуска без "v", если сборка сделана точно с тега выпуска, иначе null.
 * Тег берется из CI_COMMIT_TAG или из тегов, стоящих на HEAD. Из имени ветки номер не
 * вычисляется: git name-rev называет коммит по ближайшему тегу после него
 */
export const getReleaseVersion = async (PATHS: TPaths) => {
  const ciVersion = parseReleaseVersion(process.env.CI_COMMIT_TAG);

  if (ciVersion) {
    return ciVersion;
  }

  try {
    const tags = await simpleGit(PATHS.appPath).raw("tag", "--points-at", "HEAD");

    for (const tag of tags.split("\n")) {
      const version = parseReleaseVersion(tag);

      if (version) {
        return version;
      }
    }
  } catch (error) {}

  return null;
};

export type TBuildInfo = {
  /** Номер выпуска, если сборка сделана с тега выпуска, иначе null */
  version: string | null;
  /** Время сборки, мс эпохи */
  build_time: number;
  /** Первые 8 символов хеша коммита */
  hash: string;
  /** Ветка или тег по git name-rev */
  branch: string;
};

/** Информация о сборке: общий источник для DefinePlugin и build-info.json */
export const getBuildInfo = async (PATHS: TPaths): Promise<TBuildInfo> => {
  let hash: string = "";

  try {
    hash = (await getHashLastCommit(PATHS)) || "";
  } catch (error) {}

  const branch = await getCurrentBranchOrTagName(PATHS);
  const version = await getReleaseVersion(PATHS);

  return { version, build_time: new Date().valueOf(), hash, branch };
};

/** Возвращает версии */
export const getVersionPackages = async (PATHS: TPaths) => {
  const versions: Record<string, string> = {};

  if (await isExist(PATHS.appPackageJson)) {
    const packageJson = require(PATHS.appPackageJson);

    const branchName = await getCurrentBranchOrTagName(PATHS);

    set(versions, packageJson.name, branchName);
  }

  if (!(await isExist(PATHS.appPackages))) {
    return versions;
  }

  const packages = await fs.readdir(PATHS.appPackages);

  for await (const moduleName of packages) {
    const packageJsonPath = path.resolve(PATHS.appPackages, moduleName, "package.json");
    if (await isExist(packageJsonPath)) {
      const { name, version } = require(packageJsonPath);

      set(versions, name, version);
    }
  }

  return versions;
};

export const getZipBundleName = () => {
  const now = new Date();

  const pad = (num: number) => num.toString().padStart(2, "0");

  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = pad(now.getFullYear());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `release_${day}-${month}-${year}_${hours}-${minutes}.zip`;
};
