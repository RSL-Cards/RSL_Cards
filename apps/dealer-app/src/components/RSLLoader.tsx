import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

/**
 * RSL Logo Loading Animation
 *
 * Logo image fades in first, then "R", "S", "L" letters appear
 * one by one in slow motion with scale. Premium feel, loops.
 */
export default function RSLLoader({ size = 80 }: { size?: number }) {
  const animLogo = useRef(new Animated.Value(0)).current;
  const animR = useRef(new Animated.Value(0)).current;
  const animS = useRef(new Animated.Value(0)).current;
  const animL = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Reset all
      Animated.parallel([
        Animated.timing(animLogo, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(animR, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(animS, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(animL, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      // Logo fades in
      Animated.timing(animLogo, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      // R appears
      Animated.timing(animR, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      // S appears
      Animated.timing(animS, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      // L appears
      Animated.timing(animL, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold visible
      Animated.delay(800),
      // Fade all out
      Animated.parallel([
        Animated.timing(animLogo, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(animR, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(animS, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(animL, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(400),
    ]);

    const loop = Animated.loop(sequence);
    loop.start();

    return () => loop.stop();
  }, [animLogo, animR, animS, animL]);

  const renderLetter = (letter: string, anim: Animated.Value, color: string) => {
    const scale = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1.1, 1],
    });
    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [6, 0],
    });
    return (
      <Animated.Text
        key={letter}
        style={[
          styles.letter,
          {
            fontSize: size,
            color,
            opacity: anim,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        {letter}
      </Animated.Text>
    );
  };

  const logoSize = Math.round(size * 1.35);
  const logoScale = animLogo.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1.05, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: animLogo,
          transform: [{ scale: logoScale }],
        }}
      >
        <Image
          source={require("../../assets/rslicon.jpeg")}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: 20,
          }}
        />
      </Animated.View>
      <View style={styles.row}>
        {renderLetter("R", animR, "#e11d48")}
        {renderLetter("S", animS, COLORS.primary)}
        {renderLetter("L", animL, "#0ea5e9")}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  letter: {
    fontWeight: "900",
    letterSpacing: 2,
  },
});
