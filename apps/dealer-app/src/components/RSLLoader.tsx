import React, { useEffect, useRef } from "react";
import { View, Image, Animated, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface RSLLoaderProps {
  size?: number;
  label?: string;
}

/**
 * Professional RSL Cards Loading Component for Mobile
 * Matches the luxury web and web-dashboard experience with official branding,
 * ambient glow, shimmering laser progress bar, and micro-typography.
 */
export default function RSLLoader({ size = 80, label = "THE OPERATING SYSTEM FOR DEALERS" }: RSLLoaderProps) {
  const animPulse = useRef(new Animated.Value(1)).current;
  const animShimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Subtle breathing pulse for logo & ambient aura
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animPulse, {
          toValue: 1.04,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(animPulse, {
          toValue: 0.97,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Shimmering laser progress bar loop
    const shimmerLoop = Animated.loop(
      Animated.timing(animShimmer, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [animPulse, animShimmer]);

  const translateX = animShimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 190],
  });

  const logoWidth = Math.round(size * 1.8);
  const logoHeight = Math.round(size * 0.65);

  return (
    <View style={styles.container}>
      {/* Ambient Red Radial Halo */}
      <Animated.View
        style={[
          styles.ambientHalo,
          {
            transform: [{ scale: animPulse }],
          },
        ]}
      />

      {/* Centered Official Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            transform: [{ scale: animPulse }],
          },
        ]}
      >
        <Image
          source={require("../../assets/rsl-logo.jpeg")}
          style={{
            width: logoWidth,
            height: logoHeight,
          }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Glowing Tech Progress Bar */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.shimmerBeam,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", "#E8001C", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBeam}
          />
        </Animated.View>
      </View>

      {/* Micro Status Indicator */}
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    position: "relative",
  },
  ambientHalo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(232, 0, 28, 0.12)",
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  track: {
    width: 170,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 9999,
    overflow: "hidden",
    position: "relative",
  },
  shimmerBeam: {
    width: 80,
    height: 3,
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  gradientBeam: {
    flex: 1,
    borderRadius: 9999,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E8001C",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
