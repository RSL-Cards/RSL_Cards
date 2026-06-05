import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface SurfaceProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  withBorder?: boolean;
}

export function Surface({
  variant = 'default',
  padding = 'md',
  withBorder = true,
  style,
  children,
  ...props
}: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: padding === 'none' ? 0 : SPACING[padding] },
        withBorder && styles.withBorder,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: COLORS.surface,
  },
  elevated: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  glass: {
    backgroundColor: 'rgba(24, 24, 27, 0.7)', // zinc-900 with opacity
  },
  withBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
