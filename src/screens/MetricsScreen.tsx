import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../components/BigButton';
import { Card } from '../components/Card';
import { useFocusEffect } from '../hooks/useFocusEffect';
import { MetricRecord, clearMetrics, loadMetrics, summarize, toCsv } from '../services/metrics';
import { colors } from '../theme';

export function MetricsScreen({ active }: { active: boolean }) {
  const [rows, setRows] = useState<MetricRecord[]>([]);
  const refresh = useCallback(() => void loadMetrics().then(setRows), []);
  useFocusEffect(active, refresh);

  const s = summarize(rows);
  const fmt = (v: number | null) => (v === null ? '—' : String(v));

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Métricas</Text>
      <View style={styles.grid}>
        <Tile icon="timer-outline" title="Até o áudio" value={fmt(s.avgTapToAudioMs)} unit="ms" />
        <Tile icon="cloud-upload-outline" title="Requisição" value={fmt(s.avgRequestMs)} unit="ms" />
        <Tile icon="warning-outline" title="Falhas" value={`${s.failures}/${s.total}`} unit={`${Math.round(s.failureRate * 100)}%`} tone={s.failures ? colors.danger : undefined} />
        <Tile icon="hand-left-outline" title="Passos" value={fmt(s.avgSteps)} unit="toques" />
      </View>

      <Text style={styles.section}>Últimas tentativas</Text>
      <Card style={{ gap: 12 }}>
        {rows.length === 0 && <Text style={styles.line}>Nenhuma tentativa ainda.</Text>}
        {rows.slice(-10).reverse().map((r) => (
          <View key={r.id} style={styles.item}>
            <Ionicons name={r.ok ? 'checkmark-circle' : 'close-circle'} size={22} color={r.ok ? colors.ok : colors.danger} />
            <Text style={[styles.line, { flex: 1 }]}>{new Date(r.at).toLocaleTimeString()} · {r.mode}</Text>
            <Text style={styles.line}>{r.ok ? `${r.tapToAudioMs ?? r.requestMs ?? '?'} ms` : r.errorKind}</Text>
          </View>
        ))}
      </Card>

      <BigButton label="Exportar CSV" icon="share-outline" variant="secondary" onPress={() => Share.share({ message: toCsv(rows) })} disabled={!rows.length} />
      <BigButton
        label="Limpar métricas"
        icon="trash-outline"
        variant="secondary"
        onPress={() =>
          Alert.alert('Limpar métricas?', 'Essa ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Limpar', style: 'destructive', onPress: () => clearMetrics().then(refresh) },
          ])
        }
      />
    </ScrollView>
  );
}

function Tile({ icon, title, value, unit, tone }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; unit: string; tone?: string }) {
  return (
    <Card style={styles.tile}>
      <Ionicons name={icon} size={22} color={tone ?? colors.accent2} />
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={[styles.tileValue, tone ? { color: tone } : null]}>{value}</Text>
      <Text style={styles.tileUnit}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48%', flexGrow: 1, gap: 4, padding: 16 },
  tileTitle: { color: colors.muted, fontSize: 14, fontWeight: '600', marginTop: 6 },
  tileValue: { color: colors.text, fontSize: 32, fontWeight: '800' },
  tileUnit: { color: colors.muted, fontSize: 14 },
  section: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { color: colors.text, fontSize: 15 },
});
