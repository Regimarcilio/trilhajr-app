// Componente de Card Reutilizável
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

const paddingMap = {
  none: 0,
  sm: SPACING.sm,
  md: SPACING.md,
  lg: SPACING.lg,
};

export const Card = React.memo(({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  style,
  onPress,
}: CardProps) => {
  const p = paddingMap[padding];

  const baseStyle: ViewStyle = {
    borderRadius: BORDER_RADIUS.lg,
    padding: p,
    ...(style || {}),
  };

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={COLORS.gradient}
        style={[{ ...baseStyle, ...SHADOWS.lg }, style]}
      >
        {onPress ? (
          <TouchableOpacityWrapper onPress={onPress}>
            {children}
          </TouchableOpacityWrapper>
        ) : (
          children
        )}
      </LinearGradient>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: COLORS.white, ...SHADOWS.sm },
    elevated: { backgroundColor: COLORS.white, ...SHADOWS.md },
    outlined: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200] },
  };

  const Component = onPress ? 'TouchableOpacity' : 'View';

  return (
    <Component
      style={[baseStyle, variantStyles[variant]]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {children}
    </Component>
  );
});

// Wrapper para TouchableOpacity dentro do LinearGradient
import { TouchableOpacity } from 'react-native';
const TouchableOpacityWrapper = ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
    {children}
  </TouchableOpacity>
);

export default Card;