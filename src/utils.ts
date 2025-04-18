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
