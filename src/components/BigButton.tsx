import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radius } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  hint?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function BigButton({ label, onPress, icon, hint, variant = 'primary', disabled }: Props) {
  const primary = variant === 'primary';
  const content = (
    <>
      {icon && <Ionicons name={icon} size={26} color={primary ? colors.onAccent : colors.text} />}
      <Text style={styles.label}>{label}</Text>
    </>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      {primary ? (
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.btn, styles.secondary]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 64, borderRadius: radius.lg, paddingHorizontal: 20, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 19, fontWeight: '700', textAlign: 'center' },
});
