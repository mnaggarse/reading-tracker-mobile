import { Ionicons } from "@expo/vector-icons";
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
        {book.cover ? (
          <Image
            source={{ uri: book.cover }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book-outline" size={48} color="#CCCCCC" />
            <Text style={styles.coverPlaceholderText}>{book.title}</Text>
          </View>
        )}
        {book.status === "completed" && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
        {book.pdfPath && (
          <View style={styles.pdfBadge}>
            <Ionicons
              name="document"
              size={16}
              color={colors.background.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
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
    padding: designTokens.spacing.sm,
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
  coverPlaceholder: {
    width: "100%",
    height: designTokens.sizes.image.cover.height,
    borderRadius: designTokens.sizes.image.cover.borderRadius,
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: {
    ...textStyles.regularSm,
    color: colors.text.light,
    textAlign: "center",
    marginTop: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
  },
  completedBadge: {
    position: "absolute",
    top: designTokens.spacing.sm,
    left: designTokens.spacing.sm,
    backgroundColor: colors.success,
    borderRadius: designTokens.borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  pdfBadge: {
    position: "absolute",
    top: designTokens.spacing.sm,
    right: designTokens.spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: designTokens.borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...textStyles.semiboldBase,
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: designTokens.spacing.sm,
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
