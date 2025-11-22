export type DomainRange = {
  a: number;
  b: number;
};

export const DEFAULT_DOMAIN: DomainRange = { a: 0, b: 4 };

export function normalizeDomain(input: DomainRange): DomainRange {
  let { a, b } = input;
  if (Number.isNaN(a) || !Number.isFinite(a)) a = DEFAULT_DOMAIN.a;
  if (Number.isNaN(b) || !Number.isFinite(b)) b = DEFAULT_DOMAIN.b;
  if (b <= a) {
    b = a + 1;
  }
  return { a, b };
}

export function formatDomain(range: DomainRange): string {
  return `{${range.a}<x<${range.b}}`;
}

export function isValidDomain(range: DomainRange): boolean {
  return Number.isFinite(range.a) && Number.isFinite(range.b) && range.b > range.a;
}
