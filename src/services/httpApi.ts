import { AppSettings, joinUrl } from '../config/settings';
import { ApiError, DescribeApi, DescribeResult, PickedImage } from './types';

function getByPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      throw new ApiError('timeout', `Sem resposta em ${timeoutMs / 1000}s.`);
    }
    throw new ApiError('unavailable', 'Não foi possível alcançar o serviço.');
  } finally {
    clearTimeout(timer);
  }
}

export function createHttpApi(s: AppSettings): DescribeApi {
  const authHeaders: Record<string, string> = s.apiToken ? { Authorization: `Bearer ${s.apiToken}` } : {};

  return {
    async describe(image: PickedImage): Promise<DescribeResult> {
      const url = joinUrl(s.baseUrl, s.endpoints.describe);
      const start = Date.now();
      let init: RequestInit;

      if (s.sendMode === 'base64') {
        init = {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ [s.imageFieldName]: image.base64 ?? '' }),
        };
      } else {
        const form = new FormData();
        form.append(s.imageFieldName, {
          uri: image.uri,
          name: image.fileName ?? 'captura.jpg',
          type: image.mimeType ?? 'image/jpeg',
        } as unknown as Blob);
        init = { method: 'POST', headers: { ...authHeaders, Accept: 'application/json' }, body: form };
      }

      const res = await fetchWithTimeout(url, init, s.timeoutMs);
      if (!res.ok) throw new ApiError('http', `Serviço respondeu com erro ${res.status}.`, res.status);

      let raw: unknown;
      try {
        raw = await res.json();
      } catch {
        throw new ApiError('invalid_response', 'A resposta não é um JSON válido.');
      }
      const text = getByPath(raw, s.responseTextPath);
      if (typeof text !== 'string' || !text.trim()) {
        throw new ApiError('invalid_response', `Campo "${s.responseTextPath}" não encontrado na resposta.`);
      }
      return { text: text.trim(), raw, requestMs: Date.now() - start };
    },

    async health() {
      const start = Date.now();
      try {
        const res = await fetchWithTimeout(joinUrl(s.baseUrl, s.endpoints.health), { headers: authHeaders }, s.timeoutMs);
        return { ok: res.ok, ms: Date.now() - start, detail: res.ok ? 'Serviço respondendo.' : `HTTP ${res.status}` };
      } catch (e) {
        return { ok: false, ms: Date.now() - start, detail: (e as Error).message };
      }
    },
  };
}
