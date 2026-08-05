// Converte um timestamp ISO (vindo da API) em texto relativo em pt-BR,
// tipo "2h atrás" / "1d atrás" — mesmo formato que existia hardcoded
// no mock, mas calculado de verdade a partir de created_at.
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mês atrás`;
  const y = Math.floor(mo / 12);
  return `${y}ano(s) atrás`;
}
