export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearch(haystack: string, query: string): boolean {
  const normalizedHaystack = normalizeSearchText(haystack);
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);

  return tokens.every((token) => normalizedHaystack.includes(token));
}
