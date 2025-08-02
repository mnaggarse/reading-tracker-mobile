import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Book } from "../lib/database";
import { colors, designTokens, textStyles } from "../lib/styles";

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function BookCard({
  book,
  onPress,
  onLongPress,
}: BookCardProps) {
  const progressPercentage =
    book.totalPages > 0 ? (book.pagesRead / book.totalPages) * 100 : 0;

  const progressColor =
    book.status === "completed"
      ? colors.success
      : book.status === "reading"
      ? colors.primary
      : designTokens.colors.progress.background;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: book.cover }}
          style={styles.cover}
          resizeMode="cover"
        />
        {book.status === "completed" && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>
            {Math.floor(progressPercentage)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    marginVertical: designTokens.spacing.sm,
    ...designTokens.shadows.md,
    width: "47%", // Two books per row with proper spacing
  },
  coverContainer: {
    position: "relative",
    marginBottom: designTokens.spacing.sm,
  },
  cover: {
    width: "100%",
    height: designTokens.sizes.image.cover.height,
    borderRadius: designTokens.sizes.image.cover.borderRadius,
  },
  completedBadge: {
    position: "absolute",
    top: designTokens.spacing.sm,
    right: designTokens.spacing.sm,
    backgroundColor: colors.success,
    borderRadius: designTokens.borderRadius.base,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    color: colors.background.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...textStyles.semiboldBase,
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: designTokens.spacing.base,
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: designTokens.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: designTokens.sizes.progress.height,
    backgroundColor: designTokens.colors.progress.background,
    borderRadius: designTokens.sizes.progress.borderRadius,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: designTokens.sizes.progress.borderRadius,
  },
  percentageText: {
    ...textStyles.semiboldSm,
    color: colors.text.secondary,
    textAlign: "right",
  },
});
