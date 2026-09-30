import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { AppSettings } from '../config/settings';

let audioReady: Promise<void> | null = null;

/** iOS: sem isso o modo silencioso (botão lateral) muta a fala. */
function prepareAudio(): Promise<void> {
  audioReady ??= setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  return audioReady;
}

/**
 * Resolve quando a fala COMEÇA (métrica: toque → início do áudio).
 * Rejeita com mensagem clara se a fala não iniciar (motor de voz ausente, etc.).
 */
export async function speak(text: string, tts: AppSettings['tts']): Promise<void> {
  await prepareAudio();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      err ? reject(err) : resolve();
    };
    const timer = setTimeout(
      () => finish(new Error('A voz não iniciou. Verifique o volume, o modo silencioso e o motor de voz do aparelho.')),
      4000,
    );
    Speech.stop();
    Speech.speak(text, {
      language: tts.language,
      rate: tts.rate,
      pitch: tts.pitch,
      volume: 1,
      onStart: () => finish(),
      onError: (e) => finish(new Error(`Erro na voz: ${e?.message ?? 'desconhecido'}`)),
    });
  });
}

export const stopSpeaking = () => Speech.stop();

export async function listVoices(): Promise<string> {
  try {
    const v = await Speech.getAvailableVoicesAsync();
    const pt = v.filter((x) => x.language.toLowerCase().startsWith('pt'));
    return `${v.length} vozes no aparelho, ${pt.length} em português.`;
  } catch {
    return 'Não foi possível listar as vozes.';
  }
}
