/** "1 draft", "3 drafts", "0 specimens": a count derived from records, never typed in. */
export function countLabel(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
