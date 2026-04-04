const STALE_HOURS = 8;

export function isStale(created_at: string): boolean {
  const diff = Date.now() - new Date(created_at).getTime();
  return diff > STALE_HOURS * 60 * 60 * 1000;
}
