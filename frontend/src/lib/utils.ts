export function toPublicUrl(p: string) {
  if (!p) return "#";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = process.env.NEXT_PUBLIC_FILE_BASE || "http://localhost:8080";
  return `${base}${p.startsWith("/") ? p : `/${p}`}`;
}
