type FilterObject = Record<string, any>;

function buildQueryStringRecursive(
  prefix: string,
  obj: FilterObject,
  params: URLSearchParams
): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value) {
        if (value instanceof Object && !Array.isArray(value)) {
          buildQueryStringRecursive(fullKey, value, params);
        } else {
          params.append(fullKey, value.toString());
        }
      }
    }
  }
}

export function buildQueryString(dto: any): string {
  const params = new URLSearchParams();
  buildQueryStringRecursive("", dto, params);
  return params.toString();
}
