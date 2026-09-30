import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Card } from '../components/Card';
import { HeroButton } from '../components/HeroButton';
import { SoundWave } from '../components/SoundWave';
import { useSettings } from '../config/SettingsContext';
import { useDescribeFlow } from '../hooks/useDescribeFlow';
import { colors, radius } from '../theme';

export function HomeScreen() {
  const { settings } = useSettings();
  const { status, text, error, warning, image, start, retry, repeatAudio, stop } = useDescribeFlow();
  const busy = status === 'picking' || status === 'sending';
  const working = status === 'sending' || status === 'speaking';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Óculos Assistivos</Text>
          <Text style={styles.sub}>O que você quer descobrir hoje?</Text>
        </View>
        <View style={styles.pill} accessibilityLabel={settings.useMock ? 'Modo simulado' : 'Conectado à API'}>
          <View style={[styles.dot, { backgroundColor: settings.useMock ? colors.accent2 : colors.ok }]} />
          <Text style={styles.pillText}>{settings.useMock ? 'Mock' : 'API'}</Text>
        </View>
      </View>

      <HeroButton label="Descrever" active={working} disabled={busy} onPress={() => start('camera')} />

      <BigButton label="Escolher da galeria" icon="images-outline" variant="secondary" onPress={() => start('library')} disabled={busy} />

      <Card style={styles.result}>
        <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
          {status === 'sending' && (
            <View style={styles.row}>
              <ActivityIndicator color={colors.accent2} />
              <Text style={styles.status}>Analisando a imagem…</Text>
            </View>
          )}
          {status === 'speaking' && (
            <View style={styles.row}>
              <SoundWave />
              <Text style={styles.status}>Falando…</Text>
            </View>
          )}
          {status === 'error' && (
            <View style={styles.row}>
              <Ionicons name="alert-circle" size={28} color={colors.danger} />
              <Text style={[styles.resp, { color: colors.danger, flex: 1, fontSize: 19, lineHeight: 26 }]}>{error}</Text>
            </View>
          )}
          {!!text && status !== 'error' && <Text style={styles.resp}>{text}</Text>}
          {!!warning && (
            <View style={styles.row}>
              <Ionicons name="volume-mute" size={20} color={colors.danger} />
              <Text style={[styles.muted, { color: colors.danger, flex: 1 }]}>{warning}</Text>
            </View>
          )}
          {status === 'idle' && !text && (
            <View style={styles.row}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.muted} />
              <Text style={styles.muted}>A descrição aparecerá aqui.</Text>
            </View>
          )}
        </View>
      </Card>

      {image && <Image source={{ uri: image.uri }} style={styles.preview} accessibilityLabel="Última imagem enviada" />}

      {status === 'error' && <BigButton label="Tentar novamente" icon="refresh" onPress={retry} />}
      {!!text && status !== 'error' && (
        <View style={styles.row2}>
          <View style={{ flex: 1 }}><BigButton label="Repetir" icon="play" variant="secondary" onPress={repeatAudio} /></View>
          <View style={{ flex: 1 }}><BigButton label="Parar" icon="stop" variant="secondary" onPress={stop} /></View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hello: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.muted, fontSize: 16, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  result: { minHeight: 120, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row2: { flexDirection: 'row', gap: 12 },
  status: { color: colors.accent2, fontSize: 20, fontWeight: '700' },
  resp: { color: colors.text, fontSize: 24, lineHeight: 33, fontWeight: '500' },
  muted: { color: colors.muted, fontSize: 17 },
  preview: { width: '100%', height: 200, borderRadius: radius.lg },
});
