import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, designTokens, textStyles } from "../lib/styles";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({
  label,
  current,
  total,
  color = colors.primary,
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {total}/{current} ({Math.floor(percentage)}%)
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: designTokens.spacing.sm,
  },
  label: {
    ...textStyles.semiboldSm,
    color: colors.text.primary,
  },
  value: {
    ...textStyles.semiboldXs,
    color: colors.text.secondary,
  },
  progressContainer: {
    height: designTokens.sizes.progress.height,
  },
  progressBar: {
    height: "100%",
    backgroundColor: designTokens.colors.progress.background,
    borderRadius: designTokens.sizes.progress.borderRadius,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: designTokens.sizes.progress.borderRadius,
  },
});
