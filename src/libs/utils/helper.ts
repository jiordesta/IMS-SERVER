export function formatDate(dateString: string, locale = 'en-US'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function enumToArray<T extends object>(enumObj: T) {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key))) // remove reverse numeric keys
    .map((key) => ({
      label: key,
      value: enumObj[key as keyof T],
    }));
}
