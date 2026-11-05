// Componente de Botão Reutilizável
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const gradientColors = {
  primary: COLORS.gradient,
  success: COLORS.gradientSuccess,
  warning: COLORS.gradientWarning,
  secondary: [COLORS.gray[200], COLORS.gray[300]],
};

const textColors = {
  primary: COLORS.white,
  success: COLORS.white,
  warning: COLORS.white,
  secondary: COLORS.gray[700],
  outline: COLORS.primary,
};

const borderColors = {
  primary: 'transparent',
  secondary: COLORS.gray[300],
  success: 'transparent',
  warning: 'transparent',
  outline: COLORS.primary,
};

export const Button = React.memo(({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) => {
  const paddingMap = {
    sm: { horizontal: SPACING.md, vertical: SPACING.sm },
    md: { horizontal: SPACING.lg, vertical: SPACING.md },
    lg: { horizontal: SPACING.xl, vertical: SPACING.lg },
  };

  const fontSizeMap = {
    sm: FONT_SIZES.sm,
    md: FONT_SIZES.md,
    lg: FONT_SIZES.lg,
  };

  const padding = paddingMap[size];
  const fontSize = fontSizeMap[size];

  const isOutline = variant === 'outline';

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
      }}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={{
              fontSize,
              fontWeight: FONT_WEIGHTS.semibold,
              color: textColors[variant],
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </View>
  );

  if (isOutline) {
    return (
      <TouchableOpacity
        style={[
          styles.outlineContainer,
          { 
            paddingHorizontal: padding.horizontal, 
            paddingVertical: padding.vertical,
            borderColor: borderColors.outline,
            width: fullWidth ? '100%' : 'auto',
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors[variant]}
      style={[
        styles.gradientContainer,
        {
          paddingHorizontal: padding.horizontal,
          paddingVertical: padding.vertical,
          borderRadius: BORDER_RADIUS.lg,
          width: fullWidth ? '100%' : 'auto',
          ...SHADOWS.md,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {content}
      </TouchableOpacity>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  outlineContainer: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'transparent',
  },
});

export default Button;