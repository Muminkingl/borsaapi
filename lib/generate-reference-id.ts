/**
 * Generates a unique reference ID for a payment transaction.
 * Format: BORSA-{userId_prefix}-{plan}-{timestamp}
 */
export function generateReferenceId(userId: string, plan: string): string {
  const userPrefix = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const planCode = plan.slice(0, 3).toUpperCase();
  return `BORSA-${userPrefix}-${planCode}-${timestamp}`;
}
