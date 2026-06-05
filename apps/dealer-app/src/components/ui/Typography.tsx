import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: '400' | '500' | '600' | '700' | '800' | '900';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  variant = 'body',
  color = COLORS.text,
  weight,
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[
        styles[variant],
        { color, textAlign: align },
        weight && { fontWeight: weight },
        // If we load custom fonts later, we can map weights to fontFamily here (e.g. Inter-Bold)
        { fontFamily: getFontFamily(weight || defaultWeights[variant]) },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const defaultWeights: Record<string, string> = {
  h1: '800',
  h2: '700',
  h3: '600',
  body: '400',
  caption: '400',
  label: '600',
};

// Map font weights to the Inter font files once loaded
function getFontFamily(weight: string) {
  switch (weight) {
    case '400': return 'Inter_400Regular';
    case '500': return 'Inter_500Medium';
    case '600': return 'Inter_600SemiBold';
    case '700': return 'Inter_700Bold';
    case '800': return 'Inter_800ExtraBold';
    case '900': return 'Inter_900Black';
    default: return 'Inter_400Regular';
  }
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
