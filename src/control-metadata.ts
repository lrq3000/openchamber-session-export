/** Archive evidence stays complete; control-plane prose must fit bounded journals and SDK replies. */
export function boundedStrings(values: unknown[], maximum = 25, byteBudget = 16 * 1024): string[] {
  const result: string[] = []; let bytes = 0, omitted = false;
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const text = Buffer.byteLength(value) > 2048 ? Buffer.from(value).subarray(0, 2048).toString('utf8') + '… [truncated; inspect the archive]' : value;
    if (result.length >= maximum || bytes + Buffer.byteLength(text) > byteBudget - 128) { omitted = true; continue; }
    result.push(text); bytes += Buffer.byteLength(text);
  }
  if (omitted && result.length < maximum) result.push('Additional details remain in the archive or private job journal.');
  return result;
}
