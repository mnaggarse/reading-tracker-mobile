import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BookCard from "../components/BookCard";
import { Book, database } from "../lib/database";
import { addSampleData } from "../lib/sampleData";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
    setRefreshing(false);
  };

  const handleAddSampleData = () => {
    try {
      addSampleData();
      loadBooks();
      Alert.alert("Success", "Sample books added successfully!");
    } catch (error) {
      console.error("Error adding sample data:", error);
      Alert.alert("Error", "Failed to add sample data");
    }
  };

  const handleBookPress = (book: Book) => {
    Alert.alert("Update Progress", `Update pages read for "${book.title}"`, [
      { text: "Cancel", style: "cancel" },
      { text: "Update", onPress: () => updateBookProgress(book) },
    ]);
  };

  const updateBookProgress = (book: Book) => {
    // This would typically open a modal or navigate to an edit screen
    Alert.alert(
      "Coming Soon",
      "Progress update feature will be implemented soon!"
    );
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
      loadBooks();
      Alert.alert("Success", "Book deleted successfully");
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookList}
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={() => handleBookPress(book)}
              onLongPress={() => handleBookLongPress(book)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {books.length === 0 && (
        <View style={styles.sampleDataContainer}>
          <Text style={styles.sampleDataText}>
            No books yet. Add some sample books to get started!
          </Text>
          <TouchableOpacity
            style={styles.sampleDataButton}
            onPress={handleAddSampleData}
          >
            <Text style={styles.sampleDataButtonText}>Add Sample Books</Text>
          </TouchableOpacity>
        </View>
      )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  sampleDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginHorizontal: 16,
  },
  sampleDataText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  sampleDataButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sampleDataButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  bookList: {
    paddingHorizontal: 8,
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
});
