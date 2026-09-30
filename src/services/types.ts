export interface PickedImage {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  /** Base64 sem prefixo data:, preenchido quando sendMode = 'base64'. */
  base64?: string | null;
  /** Tamanho do arquivo em bytes, se conhecido (métrica). */
  fileSize?: number;
}

export interface DescribeResult {
  /** Texto final que será mostrado e falado. */
  text: string;
  /** Resposta crua do servidor (útil para depurar o contrato JSON do Grupo 8). */
  raw: unknown;
  /** Tempo da chamada de rede/mock, em ms. */
  requestMs: number;
}

export type ApiErrorKind = 'unavailable' | 'timeout' | 'http' | 'invalid_response';

export class ApiError extends Error {
  constructor(public kind: ApiErrorKind, message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface DescribeApi {
  describe(image: PickedImage): Promise<DescribeResult>;
  /** Verifica se o serviço responde (botão "Testar conexão"). */
  health(): Promise<{ ok: boolean; ms: number; detail: string }>;
}
