import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  style?: ViewStyle;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  style,
  disabled = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          styles[size],
          styles[variant],
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Typography
          variant={size === 'hero' ? 'h2' : 'body'}
          weight="700"
          color={getTextColor(variant)}
        >
          {size === 'hero' ? label.toUpperCase() : label}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

function getTextColor(variant: string) {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return COLORS.text;
    case 'secondary':
      return COLORS.zinc950;
    default:
      return COLORS.white;
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },

  // Sizes
  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  hero: {
    height: 140,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.glowPrimary,
  },
  secondary: {
    backgroundColor: COLORS.zinc50,
  },
  destructive: {
    backgroundColor: COLORS.destructive,
    ...SHADOWS.glowDestructive,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});
