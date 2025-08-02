import { StyleSheet } from "react-native";
import { fontSizes, getFontFamily, getFontSize } from "./fonts";

// Design System Variables
export const designTokens = {
  // Colors
  colors: {
    primary: "#6147E5",
    secondary: "#666666",
    success: "#4CAF50",
    warning: "#FF9800",
    danger: "#F44336",
    text: {
      primary: "#1A1A1A",
      secondary: "#4A4A4A",
      light: "#8A8A8A",
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F8F9FA",
    },
    border: "#E5E7EB",
    progress: {
      background: "#F3F4F6",
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
    "6xl": 60,
  },

  // Border Radius
  borderRadius: {
    sm: 6,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  // Component Sizes
  sizes: {
    button: {
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    input: {
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    card: {
      padding: 20,
      marginBottom: 20,
    },
    modal: {
      padding: 28,
      margin: 24,
    },
    image: {
      cover: {
        height: 220,
        borderRadius: 12,
      },
      placeholder: {
        height: 160,
      },
    },
    progress: {
      height: 12,
      borderRadius: 6,
    },
  },

  // Typography
  typography: {
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
} as const;

// Font style helpers
export const fontStyles = {
  regular: (size: keyof typeof fontSizes = "base") => ({
    fontFamily: getFontFamily("regular"),
    fontSize: getFontSize(size),
  }),
  semibold: (size: keyof typeof fontSizes = "base") => ({
    fontFamily: getFontFamily("semibold"),
    fontSize: getFontSize(size),
  }),
};

// Common text styles
export const textStyles = StyleSheet.create({
  // Regular text styles
  regularXs: fontStyles.regular("xs"),
  regularSm: fontStyles.regular("sm"),
  regularBase: fontStyles.regular("base"),
  regularLg: fontStyles.regular("lg"),
  regularXl: fontStyles.regular("xl"),
  regular2xl: fontStyles.regular("2xl"),
  regular3xl: fontStyles.regular("3xl"),
  regular4xl: fontStyles.regular("4xl"),

  // Semibold text styles
  semiboldXs: fontStyles.semibold("xs"),
  semiboldSm: fontStyles.semibold("sm"),
  semiboldBase: fontStyles.semibold("base"),
  semiboldLg: fontStyles.semibold("lg"),
  semiboldXl: fontStyles.semibold("xl"),
  semibold2xl: fontStyles.semibold("2xl"),
  semibold3xl: fontStyles.semibold("3xl"),
  semibold4xl: fontStyles.semibold("4xl"),
});

// Color constants for consistency (keeping for backward compatibility)
export const colors = designTokens.colors;
