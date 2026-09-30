import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tudo que depende do backend (Grupos 2, 4, 7 e 8) fica aqui e é editável
 * na tela "Ajustes". Nada de URL/campo fixo espalhado pelo código.
 */
export type SendMode = 'multipart' | 'base64';

export interface AppSettings {
  /** true = respostas simuladas, nenhuma rede é usada. */
  useMock: boolean;
  /** Ex.: http://192.168.0.10:8000 (IP do notebook na mesma rede/hotspot). */
  baseUrl: string;
  /** Caminhos relativos ao baseUrl. */
  endpoints: {
    health: string;
    describe: string;
  };
  /** Cabeçalho Authorization: Bearer <token>. Vazio = não envia. */
  apiToken: string;
  timeoutMs: number;
  /** multipart = arquivo no form-data; base64 = JSON {image: "..."}. */
  sendMode: SendMode;
  /** Nome do campo que carrega a imagem (form-data ou JSON). */
  imageFieldName: string;
  /** Caminho (com pontos) do texto na resposta JSON. Ex.: "description" ou "data.descricao". */
  responseTextPath: string;
  /** Redução/compressão antes do envio (0-1). Afeta tamanho do arquivo e latência. */
  imageQuality: number;
  mock: {
    delayMs: number;
    /** 0-1: probabilidade de simular falha de rede. */
    failRate: number;
  };
  tts: {
    language: string;
    rate: number;
    pitch: number;
    autoSpeak: boolean;
  };
}

const env = (k: string): string | undefined =>
  (process.env as Record<string, string | undefined>)[k];

export const DEFAULT_SETTINGS: AppSettings = {
  useMock: env('EXPO_PUBLIC_USE_MOCK') !== 'false',
  baseUrl: env('EXPO_PUBLIC_API_BASE_URL') ?? 'http://192.168.0.10:8000',
  endpoints: { health: '/health', describe: '/describe' },
  apiToken: '',
  timeoutMs: 15000,
  sendMode: 'multipart',
  imageFieldName: 'image',
  responseTextPath: 'description',
  imageQuality: 0.7,
  mock: { delayMs: 1200, failRate: 0 },
  tts: { language: 'pt-BR', rate: 1.0, pitch: 1.0, autoSpeak: true },
};

const KEY = '@oculos/settings/v1';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

/** Merge profundo simples: campos novos de versões futuras ganham o default. */
function mergeSettings<T>(base: T, patch: unknown): T {
  if (typeof base !== 'object' || base === null || typeof patch !== 'object' || patch === null) {
    return (patch === undefined ? base : (patch as T));
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    out[k] = k in out ? mergeSettings(out[k], v) : v;
  }
  return out as T;
}

export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
