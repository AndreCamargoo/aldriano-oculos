import { AppSettings } from '../config/settings';
import { ApiError, DescribeApi, DescribeResult, PickedImage } from './types';

const DESCRIPTIONS = [
  'Uma mesa de madeira com um notebook aberto e uma xícara de café ao lado.',
  'Um corredor iluminado com uma porta ao fundo, à sua frente, a cerca de três metros.',
  'Uma pessoa de camisa azul sentada em uma cadeira, olhando para a câmera.',
  'Uma rua com dois carros estacionados à direita e uma calçada livre à esquerda.',
  'Uma placa com o texto "SAÍDA" acima de uma porta de vidro.',
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createMockApi(settings: AppSettings): DescribeApi {
  let i = 0;
  return {
    async describe(_image: PickedImage): Promise<DescribeResult> {
      const start = Date.now();
      await sleep(settings.mock.delayMs);
      if (Math.random() < settings.mock.failRate) {
        throw new ApiError('unavailable', 'Falha simulada de rede (mock).');
      }
      const text = DESCRIPTIONS[i++ % DESCRIPTIONS.length];
      const raw = { description: text, mock: true };
      return { text, raw, requestMs: Date.now() - start };
    },
    async health() {
      await sleep(200);
      return { ok: true, ms: 200, detail: 'Modo mock ativo (nenhuma rede usada).' };
    },
  };
}
