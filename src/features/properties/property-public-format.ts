export function formatPublicPropertyMoney(
  value: number | null | undefined,
  currency: string | null | undefined,
) {
  const normalizedCurrency = currency?.trim();

  if (value === null || value === undefined || !normalizedCurrency) {
    return null;
  }

  return `${normalizedCurrency} ${new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatPublicCommonExpenses(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const amount = new Intl.NumberFormat("es-UY", {
    maximumFractionDigits: 0,
  }).format(value);

  return `$ ${amount}`;
}
