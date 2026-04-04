export function isStale(dateStr: string | null): boolean {
  if (!dateStr) return true;
  const timeDiff = Date.now() - new Date(dateStr).getTime();
  const HOURE_IN_MS = 60 * 60 * 1000;
  return timeDiff > 24 * HOURE_IN_MS; 
}
