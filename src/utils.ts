function buildQueryStringRecursive(
  prefix: string,
  obj: FilterObject,
  params: URLSearchParams
): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (value !== undefined && value !== null) {
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

export function formatCurrency(value: number): string {
  const numericValue = value / 100;
  const formattedValue = numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedValue;
}
