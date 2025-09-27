export function isYYYYMM(s: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}
export function normalizeYYYYMM(s: string) {
  // admite 'YYYY/MM' o 'YYYY-MM' → devuelve 'YYYY-MM'
  return s.replace('/', '-');
}
