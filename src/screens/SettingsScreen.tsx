import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { BigButton } from '../components/BigButton';
import { useSettings } from '../config/SettingsContext';
import { AppSettings, SendMode } from '../config/settings';
import { createApi } from '../services/api';
import { listVoices, speak } from '../services/tts';
import { colors, radius } from '../theme';

export function SettingsScreen() {
  const { settings, update, reset } = useSettings();
  const [d, setD] = useState<AppSettings>(settings);
  const [testMsg, setTestMsg] = useState('');
  const [voiceMsg, setVoiceMsg] = useState('');

  const testVoice = async () => {
    setVoiceMsg(await listVoices());
    try {
      await speak('Teste de voz. Se você está ouvindo isso, o áudio está funcionando.', d.tts);
    } catch (e) {
      setVoiceMsg((m) => `${m}\n🔇 ${(e as Error).message}`);
    }
  };

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setD((p) => ({ ...p, [k]: v }));
  const num = (t: string, fallback: number) => (Number.isFinite(parseFloat(t)) ? parseFloat(t) : fallback);

  const test = async () => {
    setTestMsg('Testando…');
    const r = await createApi(d).health();
    setTestMsg(`${r.ok ? '✅' : '❌'} ${r.detail} (${r.ms} ms)`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <Row label="Usar dados simulados (mock)">
          <Switch trackColor={{ true: colors.accent }} value={d.useMock} onValueChange={(v) => set('useMock', v)} />
        </Row>
      </Card>

      <Section title="API (notebook / serviço)" icon="server-outline">
      <Field label="URL base" value={d.baseUrl} onChangeText={(v) => set('baseUrl', v)} placeholder="http://192.168.0.10:8000" />
      <Field label="Endpoint de saúde" value={d.endpoints.health} onChangeText={(v) => set('endpoints', { ...d.endpoints, health: v })} />
      <Field label="Endpoint de descrição" value={d.endpoints.describe} onChangeText={(v) => set('endpoints', { ...d.endpoints, describe: v })} />
      <Field label="Token (opcional)" value={d.apiToken} onChangeText={(v) => set('apiToken', v)} secure />
      <Field label="Timeout (ms)" value={String(d.timeoutMs)} onChangeText={(v) => set('timeoutMs', num(v, d.timeoutMs))} numeric />

      </Section>

      <Section title="Contrato JSON" icon="code-slash-outline">
      <Row label={`Envio da imagem: ${d.sendMode === 'multipart' ? 'multipart' : 'base64 (JSON)'}`}>
        <Switch
          value={d.sendMode === 'base64'}
          onValueChange={(v) => set('sendMode', (v ? 'base64' : 'multipart') as SendMode)}
        />
      </Row>
      <Field label="Campo da imagem" value={d.imageFieldName} onChangeText={(v) => set('imageFieldName', v)} />
      <Field label="Caminho do texto na resposta" value={d.responseTextPath} onChangeText={(v) => set('responseTextPath', v)} placeholder="description ou data.descricao" />
      <Field label="Qualidade da imagem (0–1)" value={String(d.imageQuality)} onChangeText={(v) => set('imageQuality', Math.min(1, Math.max(0.1, num(v, d.imageQuality))))} numeric />

      </Section>

      <Section title="Simulação (mock)" icon="flask-outline">
      <Field label="Atraso simulado (ms)" value={String(d.mock.delayMs)} onChangeText={(v) => set('mock', { ...d.mock, delayMs: num(v, d.mock.delayMs) })} numeric />
      <Field label="Taxa de falha simulada (0–1)" value={String(d.mock.failRate)} onChangeText={(v) => set('mock', { ...d.mock, failRate: Math.min(1, Math.max(0, num(v, d.mock.failRate))) })} numeric />

      </Section>

      <Section title="Voz (TTS)" icon="volume-high-outline">
      <Row label="Falar automaticamente">
        <Switch trackColor={{ true: colors.accent }} value={d.tts.autoSpeak} onValueChange={(v) => set('tts', { ...d.tts, autoSpeak: v })} />
      </Row>
      <Field label="Idioma" value={d.tts.language} onChangeText={(v) => set('tts', { ...d.tts, language: v })} />
      <Field label="Velocidade" value={String(d.tts.rate)} onChangeText={(v) => set('tts', { ...d.tts, rate: num(v, d.tts.rate) })} numeric />

      </Section>

      {!!voiceMsg && <Text style={styles.test}>{voiceMsg}</Text>}
      <BigButton label="Testar voz" icon="volume-high" variant="secondary" onPress={testVoice} />

      {!!testMsg && <Text style={styles.test}>{testMsg}</Text>}
      <BigButton label="Testar conexão" icon="pulse" variant="secondary" onPress={test} />
      <BigButton
        label="Salvar" icon="checkmark-circle"
        onPress={async () => {
          await update(d);
          Alert.alert('Ajustes salvos');
        }}
      />
      <BigButton
        label="Restaurar padrões" icon="refresh"
        variant="secondary"
        onPress={async () => {
          await reset();
          Alert.alert('Padrões restaurados', 'Reabra esta aba para ver os valores.');
        }}
      />
    </ScrollView>
  );
}

function Section({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={20} color={colors.accent2} />
        <Text style={styles.section}>{title}</Text>
      </View>
      <Card style={{ gap: 14 }}>{children}</Card>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { flex: 1 }]}>{label}</Text>
      {children}
    </View>
  );
}

function Field(p: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; numeric?: boolean; secure?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{p.label}</Text>
      <TextInput
        style={styles.input}
        value={p.value}
        onChangeText={p.onChangeText}
        placeholder={p.placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={p.secure}
        keyboardType={p.numeric ? 'numeric' : p.label.includes('URL') ? 'url' : 'default'}
        accessibilityLabel={p.label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 18 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  section: { color: colors.text, fontSize: 18, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { backgroundColor: colors.bg, color: colors.text, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, fontSize: 18 },
  test: { color: colors.text, fontSize: 18 },
});
