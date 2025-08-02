import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Book } from "../lib/database";

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

  const getProgressColor = () => {
    if (book.status === "completed") return "#4CAF50";
    if (book.status === "reading") return "#3B82F6";
    return "#E0E0E0";
  };

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
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: "47%", // Two books per row with proper spacing
  },
  coverContainer: {
    position: "relative",
    marginBottom: 8,
  },
  cover: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333333",
    marginBottom: 8,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: "auto",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
});
