import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BookCard from "../components/BookCard";
import { Book, database } from "../lib/database";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [newPagesRead, setNewPagesRead] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const params = useLocalSearchParams();

  const loadBooks = () => {
    try {
      const allBooks = database.getBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading books:", error);
      Alert.alert("Error", "Failed to load books");
    }
  };

  useEffect(() => {
    loadBooks();
  }, [refreshTrigger]);

  // Listen for navigation parameters to trigger refresh
  useEffect(() => {
    if (params.refresh) {
      loadBooks();
    }
  }, [params.refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setNewPagesRead(book.pagesRead.toString());
    setProgressModalVisible(true);
  };

  const updateBookProgress = () => {
    if (!selectedBook) return;

    const pagesRead = parseInt(newPagesRead);
    if (
      isNaN(pagesRead) ||
      pagesRead < 0 ||
      pagesRead > selectedBook.totalPages
    ) {
      Alert.alert("Error", "Please enter a valid number of pages");
      return;
    }

    try {
      let newStatus = selectedBook.status;
      if (pagesRead === 0) {
        newStatus = "to-read";
      } else if (pagesRead === selectedBook.totalPages) {
        newStatus = "completed";
      } else {
        newStatus = "reading";
      }

      database.updateBookProgress(selectedBook.id!, pagesRead, newStatus);
      setProgressModalVisible(false);
      setSelectedBook(null);
      setNewPagesRead("");

      // Force immediate refresh
      setRefreshTrigger((prev) => prev + 1);

      Alert.alert("Success", "Progress updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to library with refresh parameter
            router.push({
              pathname: "/",
              params: { refresh: Date.now() },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  const handleBookLongPress = (book: Book) => {
    Alert.alert("Book Options", `Options for "${book.title}"`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBook(book.id!),
      },
    ]);
  };

  const deleteBook = (id: number) => {
    try {
      database.deleteBook(id);

      // Force immediate refresh
      setRefreshTrigger((prev) => prev + 1);

      Alert.alert("Success", "Book deleted successfully", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to library with refresh parameter
            router.push({
              pathname: "/",
              params: { refresh: Date.now() },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "Failed to delete book");
    }
  };

  const getBooksByStatus = (status: Book["status"]) => {
    return books.filter((book) => book.status === status);
  };

  const renderBookSection = (
    title: string,
    books: Book[],
    emptyMessage: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {books.length > 0 ? (
        <View style={styles.bookGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={() => handleBookPress(book)}
              onLongPress={() => handleBookLongPress(book)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderBookSection(
          "Currently Reading",
          getBooksByStatus("reading"),
          "No books currently being read"
        )}

        {renderBookSection(
          "To Read",
          getBooksByStatus("to-read"),
          "No books in your reading list"
        )}

        {renderBookSection(
          "Completed",
          getBooksByStatus("completed"),
          "No completed books yet"
        )}
      </ScrollView>

      {/* Progress Update Modal */}
      <Modal
        visible={progressModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Update Progress - {selectedBook?.title}
            </Text>
            <Text style={styles.modalSubtitle}>
              Pages read: {selectedBook?.pagesRead} / {selectedBook?.totalPages}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pages Read:</Text>
              <TextInput
                style={styles.modalInput}
                value={newPagesRead}
                onChangeText={setNewPagesRead}
                keyboardType="numeric"
                placeholder="Enter pages read"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setProgressModalVisible(false);
                  setSelectedBook(null);
                  setNewPagesRead("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateBookProgress}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingTop: 50, // Add top padding for status bar
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    marginTop: 8,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  updateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
