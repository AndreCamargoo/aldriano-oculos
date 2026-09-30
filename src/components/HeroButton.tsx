import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../theme';

interface Props {
  onPress: () => void;
  active: boolean; // enviando/falando: ativa o pulso
  disabled?: boolean;
  label: string;
}

const SIZE = 168;

export function HeroButton({ onPress, active, disabled, label }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ring = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  };

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ring]} pointerEvents="none" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre a câmera, envia a foto e lê a descrição em voz alta"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: disabled ? 0.7 : 1 })}
      >
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
          <Ionicons name={active ? 'sparkles' : 'camera'} size={64} color={colors.onAccent} />
        </LinearGradient>
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 22 },
  ring: { position: 'absolute', top: 28, width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.accent },
  btn: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 14,
  },
  label: { color: colors.text, fontSize: 22, fontWeight: '800' },
});
