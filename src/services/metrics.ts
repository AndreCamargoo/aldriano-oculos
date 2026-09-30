import AsyncStorage from '@react-native-async-storage/async-storage';

/** Uma linha por tentativa — alimenta as tabelas do relatório. */
export interface MetricRecord {
  id: string;
  at: number;
  mode: 'mock' | 'api';
  ok: boolean;
  errorKind?: string;
  /** Passos de interação do usuário até a resposta (acessibilidade). */
  steps: number;
  imageBytes?: number;
  /** Tempo da requisição (rede + processamento no servidor). */
  requestMs?: number;
  /** Toque no botão → início da fala. */
  tapToAudioMs?: number;
}

const KEY = '@oculos/metrics/v1';
const MAX = 500;

export async function loadMetrics(): Promise<MetricRecord[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');
  } catch {
    return [];
  }
}

export async function addMetric(m: MetricRecord): Promise<void> {
  const all = await loadMetrics();
  all.push(m);
  await AsyncStorage.setItem(KEY, JSON.stringify(all.slice(-MAX)));
}

export const clearMetrics = () => AsyncStorage.removeItem(KEY);

export function summarize(rows: MetricRecord[]) {
  const ok = rows.filter((r) => r.ok);
  const avg = (xs: (number | undefined)[]) => {
    const v = xs.filter((x): x is number => typeof x === 'number');
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
  };
  return {
    total: rows.length,
    failures: rows.length - ok.length,
    failureRate: rows.length ? (rows.length - ok.length) / rows.length : 0,
    avgTapToAudioMs: avg(ok.map((r) => r.tapToAudioMs)),
    avgRequestMs: avg(ok.map((r) => r.requestMs)),
    avgSteps: avg(rows.map((r) => r.steps)),
  };
}

export function toCsv(rows: MetricRecord[]): string {
  const head = 'data,modo,ok,erro,passos,bytes_imagem,ms_requisicao,ms_toque_ate_audio';
  const lines = rows.map((r) =>
    [new Date(r.at).toISOString(), r.mode, r.ok, r.errorKind ?? '', r.steps, r.imageBytes ?? '', r.requestMs ?? '', r.tapToAudioMs ?? ''].join(','),
  );
  return [head, ...lines].join('\n');
}
