import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSettings } from '../config/SettingsContext';
import { createApi } from '../services/api';
import { addMetric } from '../services/metrics';
import { speak, stopSpeaking } from '../services/tts';
import { ApiError, PickedImage } from '../services/types';

export type Status = 'idle' | 'picking' | 'sending' | 'speaking' | 'done' | 'error';
export type Source = 'camera' | 'library';

export function useDescribeFlow() {
  const { settings } = useSettings();
  const api = useMemo(() => createApi(settings), [settings]);
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const lastSource = useRef<Source>('camera');

  const pick = useCallback(
    async (source: Source): Promise<PickedImage | null> => {
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: settings.imageQuality,
        base64: settings.sendMode === 'base64',
      };
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) throw new Error('Permissão da câmera negada.');
      }
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets[0]) return null;
      const a = res.assets[0];
      return {
        uri: a.uri,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType,
        fileName: a.fileName ?? undefined,
        base64: a.base64,
        fileSize: a.fileSize,
      };
    },
    [settings.imageQuality, settings.sendMode],
  );

  /** Envia uma imagem já escolhida: API -> TTS, registrando métricas. */
  const send = useCallback(
    async (img: PickedImage, steps: number) => {
      const t0 = Date.now();
      const mode = settings.useMock ? 'mock' : 'api';
      setStatus('sending');
      setError('');
      setWarning('');
      try {
        const result = await api.describe(img);
        setText(result.text);
        let tapToAudioMs: number | undefined;
        let warning = '';
        if (settings.tts.autoSpeak) {
          setStatus('speaking');
          try {
            await speak(result.text, settings.tts);
            tapToAudioMs = Date.now() - t0;
          } catch (e) {
            warning = (e as Error).message; // a descrição já chegou: mostra o texto e avisa da voz
          }
        }
        setWarning(warning);
        setStatus('done');
        await addMetric({
          id: String(t0), at: t0, mode, ok: true, steps,
          imageBytes: img.fileSize, requestMs: result.requestMs, tapToAudioMs,
        });
      } catch (e) {
        const kind = e instanceof ApiError ? e.kind : 'unknown';
        setError(friendlyError(e));
        setStatus('error');
        await addMetric({ id: String(t0), at: t0, mode, ok: false, errorKind: kind, steps, imageBytes: img.fileSize });
      }
    },
    [api, settings.tts, settings.useMock],
  );

  const start = useCallback(
    async (source: Source) => {
      lastSource.current = source;
      stopSpeaking();
      setStatus('picking');
      setError('');
      try {
        const img = await pick(source);
        if (!img) return setStatus('idle');
        setImage(img);
        // passos: câmera = 1 toque (+ obturador do sistema); galeria = abrir + escolher
        await send(img, source === 'camera' ? 1 : 2);
      } catch (e) {
        setError(friendlyError(e));
        setStatus('error');
      }
    },
    [pick, send],
  );

  const retry = useCallback(() => (image ? send(image, 1) : start(lastSource.current)), [image, send, start]);
  const repeatAudio = useCallback(
    () => text && speak(text, settings.tts).then(() => setWarning(''), (e: Error) => setWarning(e.message)),
    [text, settings.tts],
  );

  return { status, text, error, warning, image, start, retry, repeatAudio, stop: stopSpeaking };
}

function friendlyError(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.kind) {
      case 'unavailable': return 'Serviço indisponível. Verifique se o notebook e o celular estão na mesma rede e se a API está rodando.';
      case 'timeout': return 'O serviço demorou demais para responder. Tente novamente.';
      case 'http': return `O serviço retornou um erro (${e.status}).`;
      case 'invalid_response': return `Resposta inesperada do serviço: ${e.message}`;
    }
  }
  return e instanceof Error ? e.message : 'Algo deu errado.';
}
