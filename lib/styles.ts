import { StyleSheet } from "react-native";
import { fontSizes, getFontFamily, getFontSize } from "./fonts";

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

// Color constants for consistency
export const colors = {
  primary: "#3B82F6",
  secondary: "#666666",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#999999",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F8F9FA",
  },
  border: "#E0E0E0",
} as const;
