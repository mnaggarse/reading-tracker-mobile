import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  label,
  current,
  total,
  color = "#2196F3",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {current}/{total}{" "}
          {showPercentage ? `(${Math.round(percentage)}%)` : ""}
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
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  value: {
    fontSize: 12,
    color: "#666666",
  },
  progressContainer: {
    height: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
