import fs from "fs/promises";
import type { TPaths } from "../../../paths";
import { set, trim } from "lodash";
import path from "path";
import simpleGit from "simple-git";

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
