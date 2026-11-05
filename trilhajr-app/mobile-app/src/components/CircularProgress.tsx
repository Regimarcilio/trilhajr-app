// Componente de Progresso Circular
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  duration?: number;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  color = COLORS.primary,
  backgroundColor = COLORS.gray[200],
  animated = true,
  duration = 1000,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const [animatedProgress, setAnimatedProgress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(progress);
    }
  }, [progress, animated, duration]);

  const progressInterpolation = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressInterpolation}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.centerContent}>
        {showPercentage && (
          <Text style={styles.percentageText}>
            {Math.round(progress)}%
          </Text>
        )}
        {children}
      </View>
    </View>
  );
};

// Componente animado separado para evitar re-renders
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray[800],
  },
});

export { CircularProgress };
export default CircularProgress;