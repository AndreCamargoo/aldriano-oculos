import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/config/SettingsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { MetricsScreen } from './src/screens/MetricsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme';

type Tab = 'home' | 'metrics' | 'settings';
const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Descrever', icon: 'camera-outline', iconOn: 'camera' },
  { key: 'metrics', label: 'Métricas', icon: 'stats-chart-outline', iconOn: 'stats-chart' },
  { key: 'settings', label: 'Ajustes', icon: 'settings-outline', iconOn: 'settings' },
];

function Shell() {
  const { ready } = useSettings();
  const [tab, setTab] = useState<Tab>('home');
  if (!ready) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {/* Telas permanecem montadas para não perder estado ao trocar de aba. */}
      <View style={[styles.screen, tab !== 'home' && styles.hidden]}><HomeScreen /></View>
      <View style={[styles.screen, tab !== 'metrics' && styles.hidden]}><MetricsScreen active={tab === 'metrics'} /></View>
      {tab === 'settings' && <View style={styles.screen}><SettingsScreen /></View>}

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
            onPress={() => setTab(t.key)}
            style={styles.tab}
          >
            <View style={[styles.tabInner, tab === t.key && styles.tabOn]}>
              <Ionicons name={tab === t.key ? t.iconOn : t.icon} size={24} color={tab === t.key ? colors.accent2 : colors.muted} />
              <Text style={[styles.tabText, tab === t.key && { color: colors.text }]}>{t.label}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Shell />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  hidden: { display: 'none' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, padding: 6, backgroundColor: colors.surface, borderRadius: 28, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1 },
  tabInner: { minHeight: 56, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabOn: { backgroundColor: colors.surfaceHi },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
