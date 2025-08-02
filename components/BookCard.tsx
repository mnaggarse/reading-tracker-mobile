import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Book } from "../lib/database";
import { colors, textStyles } from "../lib/styles";

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
      ? "#4CAF50"
      : book.status === "reading"
      ? "#6147E5"
      : "#E5E7EB";

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
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    width: "47%", // Two books per row with proper spacing
  },
  coverContainer: {
    position: "relative",
    marginBottom: 8,
  },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    borderRadius: 12,
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
    marginBottom: 12,
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentageText: {
    ...textStyles.semiboldSm,
    color: colors.text.secondary,
    textAlign: "right",
  },
});
