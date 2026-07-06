export function uniqueEmail(prefix = 'e2e') {
  const t = Date.now();
  return `${prefix}+${t}@example.com`;
}

export function uniqueTenantName(prefix = 'e2e-tenant') {
  return `${prefix}-${Date.now()}`;
}
