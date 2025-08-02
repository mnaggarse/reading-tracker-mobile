import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import ConfirmModal from "../components/ConfirmModal";
import { Book, database } from "../lib/database";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [newPagesRead, setNewPagesRead] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTotalPages, setEditTotalPages] = useState("");
  const [editStatus, setEditStatus] = useState<Book["status"]>("to-read");
  const [editCover, setEditCover] = useState("");
  const [pagesWarningModalVisible, setPagesWarningModalVisible] =
    useState(false);
  const [pendingEditData, setPendingEditData] = useState<{
    title: string;
    totalPages: number;
    cover: string;
  } | null>(null);
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

  const showValidationError = (message: string) => {
    setValidationMessage(message);
    setValidationModalVisible(true);
  };

  const updateBookProgress = () => {
    if (!selectedBook) return;

    const pagesRead = parseInt(newPagesRead);
    if (isNaN(pagesRead) || pagesRead < 0) {
      showValidationError(
        "Please enter a valid number of pages (must be 0 or greater)."
      );
      return;
    }

    if (pagesRead > selectedBook.totalPages) {
      showValidationError(
        `You cannot read more pages than the book has. The book has ${selectedBook.totalPages} pages.`
      );
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

      // Navigate back to library with refresh parameter
      router.push({
        pathname: "/",
        params: { refresh: Date.now() },
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  const handleBookLongPress = (book: Book) => {
    setBookToEdit(book);
    setEditTitle(book.title);
    setEditTotalPages(book.totalPages.toString());
    setEditStatus(book.status);
    setEditCover(book.cover);
    setEditModalVisible(true);
  };

  const handleEditBook = () => {
    if (!bookToEdit) return;

    if (!editTitle.trim()) {
      showValidationError("Please enter a book title.");
      return;
    }

    if (
      !editTotalPages.trim() ||
      isNaN(Number(editTotalPages)) ||
      Number(editTotalPages) <= 0
    ) {
      showValidationError(
        "Please enter a valid number of pages (must be greater than 0)."
      );
      return;
    }

    if (Number(editTotalPages) < bookToEdit.pagesRead) {
      setPagesWarningModalVisible(true);
      setPendingEditData({
        title: editTitle,
        totalPages: Number(editTotalPages),
        cover: editCover,
      });
      return;
    }

    proceedWithEdit();
  };

  const proceedWithEdit = () => {
    if (!bookToEdit) return;

    try {
      const newTotalPages = pendingEditData
        ? pendingEditData.totalPages
        : Number(editTotalPages);
      const newTitle = pendingEditData
        ? pendingEditData.title
        : editTitle.trim();
      const newCover = pendingEditData ? pendingEditData.cover : editCover;

      // Reset pages read to 0 if total pages is less than current pages read
      const newPagesRead =
        newTotalPages < bookToEdit.pagesRead ? 0 : bookToEdit.pagesRead;

      let newStatus = editStatus;
      if (newPagesRead === 0) {
        newStatus = "to-read";
      } else if (newPagesRead === newTotalPages) {
        newStatus = "completed";
      } else {
        newStatus = "reading";
      }

      // Update book details in database
      database.updateBookDetails(
        bookToEdit.id!,
        newTitle,
        newTotalPages,
        newStatus,
        newCover
      );

      // Also update the pages read if it changed
      if (newPagesRead !== bookToEdit.pagesRead) {
        database.updateBookProgress(bookToEdit.id!, newPagesRead, newStatus);
      }

      setEditModalVisible(false);
      setBookToEdit(null);
      setEditTitle("");
      setEditTotalPages("");
      setEditStatus("to-read");
      setEditCover("");
      setPagesWarningModalVisible(false);
      setPendingEditData(null);

      // Force immediate refresh
      setRefreshTrigger((prev) => prev + 1);

      // Navigate back to library with refresh parameter
      router.push({
        pathname: "/",
        params: { refresh: Date.now() },
      });
    } catch (error) {
      console.error("Error updating book:", error);
      Alert.alert("Error", "Failed to update book");
    }
  };

  const handleDeleteFromEdit = () => {
    if (!bookToEdit) return;

    setBookToDelete(bookToEdit);
    setEditModalVisible(false);
    setBookToEdit(null);
    setEditTitle("");
    setEditTotalPages("");
    setEditStatus("to-read");
    setEditCover("");
    setDeleteModalVisible(true);
  };

  const pickEditImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photo library"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Book cover aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditCover(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleDeleteBook = () => {
    if (!bookToDelete) return;

    try {
      database.deleteBook(bookToDelete.id!);

      // Force immediate refresh
      setRefreshTrigger((prev) => prev + 1);

      setDeleteModalVisible(false);
      setBookToDelete(null);

      // Navigate back to library with refresh parameter
      router.push({
        pathname: "/",
        params: { refresh: Date.now() },
      });
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
        animationType="fade"
        onRequestClose={() => setProgressModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="book-outline" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.modalTitle}>Update Progress</Text>
              <Text style={styles.modalBookTitle}>{selectedBook?.title}</Text>
            </View>

            <View style={styles.totalPagesInfo}>
              <Text style={styles.totalPagesLabel}>Total Pages</Text>
              <Text style={styles.totalPagesText}>
                {selectedBook?.totalPages} pages
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pages Read:</Text>
              <View style={styles.inputWithButtons}>
                <TouchableOpacity
                  style={styles.minusButton}
                  onPress={() => {
                    const current = parseInt(newPagesRead) || 0;
                    const newValue = Math.max(0, current - 1);
                    setNewPagesRead(newValue.toString());
                  }}
                >
                  <Ionicons name="remove" size={24} color="#666666" />
                </TouchableOpacity>

                <TextInput
                  style={styles.modalInput}
                  value={newPagesRead}
                  onChangeText={setNewPagesRead}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999999"
                  textAlign="center"
                />

                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => {
                    const current = parseInt(newPagesRead) || 0;
                    const max = selectedBook?.totalPages || 0;
                    const newValue = Math.min(max, current + 1);
                    setNewPagesRead(newValue.toString());
                  }}
                >
                  <Ionicons name="add" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
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

      {/* Edit Book Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Floating Delete Button */}
            <TouchableOpacity
              style={styles.floatingDeleteButton}
              onPress={handleDeleteFromEdit}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="create" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.modalTitle}>Edit Book</Text>
              <Text style={styles.modalBookTitle}>{bookToEdit?.title}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cover Image:</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickEditImage}
              >
                {editCover ? (
                  <Image
                    source={{ uri: editCover }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#666666" />
                    <Text style={styles.imagePlaceholderText}>
                      Select Cover Image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Book Title:</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter book title"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Total Pages:</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editTotalPages}
                onChangeText={setEditTotalPages}
                keyboardType="numeric"
                placeholder="Enter total pages"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setBookToEdit(null);
                  setEditTitle("");
                  setEditTotalPages("");
                  setEditStatus("to-read");
                  setEditCover("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleEditBook}
              >
                <Text style={styles.updateButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Book Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setBookToDelete(null);
        }}
        onConfirm={handleDeleteBook}
        title="Delete Book"
        message={`Are you sure you want to delete "${bookToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        icon="trash-outline"
      />

      {/* Validation Modal */}
      <ConfirmModal
        visible={validationModalVisible}
        onClose={() => setValidationModalVisible(false)}
        onConfirm={() => setValidationModalVisible(false)}
        title="Validation Error"
        message={validationMessage}
        confirmText="OK"
        type="warning"
        icon="warning-outline"
        showCancelButton={false}
      />

      {/* Pages Warning Modal */}
      <ConfirmModal
        visible={pagesWarningModalVisible}
        onClose={() => {
          setPagesWarningModalVisible(false);
          setPendingEditData(null);
        }}
        onConfirm={() => {
          setPagesWarningModalVisible(false);
          setPendingEditData(null);
          proceedWithEdit();
        }}
        title="Reset Progress"
        message={`You are trying to set total pages to ${pendingEditData?.totalPages}, but you have already read ${bookToEdit?.pagesRead} pages. This will reset your reading progress to 0 pages.`}
        confirmText="Reset Progress"
        cancelText="Cancel"
        type="danger"
        icon="warning-outline"
      />
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
    position: "absolute",
    top: -50, // Extend beyond status bar
    left: 0,
    right: 0,
    bottom: -50, // Extend beyond navigation bar
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalIconContainer: {
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
    textAlign: "center",
  },
  modalBookTitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },

  totalPagesInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalPagesLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  totalPagesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  modalInput: {
    flex: 1,
    padding: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  inputWithButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  minusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  plusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  updateButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalTextInput: {
    height: 50,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "center",
  },
  deleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  floatingDeleteButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imagePickerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    marginTop: 8,
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  selectedImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
});
