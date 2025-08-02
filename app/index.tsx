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
import { colors, designTokens, textStyles } from "../lib/styles";

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
  const [editForm, setEditForm] = useState({
    title: "",
    totalPages: "",
    status: "to-read" as Book["status"],
    cover: "",
  });
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
        "يرجى إدخال عدد صحيح من الصفحات (يجب أن يكون 0 أو أكثر)."
      );
      return;
    }

    if (pagesRead > selectedBook.totalPages) {
      showValidationError(
        `لا يمكنك قراءة صفحات أكثر مما يحتويه الكتاب. الكتاب يحتوي على ${selectedBook.totalPages} صفحة.`
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

      setRefreshTrigger((prev) => prev + 1);
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
    setEditForm({
      title: book.title,
      totalPages: book.totalPages.toString(),
      status: book.status,
      cover: book.cover,
    });
    setEditModalVisible(true);
  };

  const handleEditBook = () => {
    if (!bookToEdit) return;

    if (!editForm.title.trim()) {
      showValidationError("يرجى إدخال عنوان الكتاب.");
      return;
    }

    if (
      !editForm.totalPages.trim() ||
      isNaN(Number(editForm.totalPages)) ||
      Number(editForm.totalPages) <= 0
    ) {
      showValidationError(
        "يرجى إدخال عدد صحيح من الصفحات (يجب أن يكون أكبر من 0)."
      );
      return;
    }

    if (Number(editForm.totalPages) < bookToEdit.pagesRead) {
      setPagesWarningModalVisible(true);
      setPendingEditData({
        title: editForm.title,
        totalPages: Number(editForm.totalPages),
        cover: editForm.cover,
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
        : Number(editForm.totalPages);
      const newTitle = pendingEditData
        ? pendingEditData.title
        : editForm.title.trim();
      const newCover = pendingEditData ? pendingEditData.cover : editForm.cover;

      // Reset pages read to 0 if total pages is less than current pages read
      const newPagesRead =
        newTotalPages < bookToEdit.pagesRead ? 0 : bookToEdit.pagesRead;

      let newStatus = editForm.status;
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
      setEditForm({
        title: "",
        totalPages: "",
        status: "to-read",
        cover: "",
      });
      setPagesWarningModalVisible(false);
      setPendingEditData(null);

      setRefreshTrigger((prev) => prev + 1);
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
    setEditForm({
      title: "",
      totalPages: "",
      status: "to-read",
      cover: "",
    });
    setDeleteModalVisible(true);
  };

  const pickEditImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photo library"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditForm((prev) => ({ ...prev, cover: result.assets[0].uri }));
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

      setRefreshTrigger((prev) => prev + 1);
      setDeleteModalVisible(false);
      setBookToDelete(null);

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
        <View style={styles.header}>
          <Text style={styles.title}>المكتبة</Text>
        </View>
        {renderBookSection(
          "قيد القراءة",
          getBooksByStatus("reading"),
          "لا توجد كتب قيد القراءة"
        )}
        {renderBookSection(
          "لم تبدأ قراءتها",
          getBooksByStatus("to-read"),
          "لا توجد كتب لم تبدأ قراءتها"
        )}
        {renderBookSection(
          "مكتملة",
          getBooksByStatus("completed"),
          "لا توجد كتب مكتملة"
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
              <Text style={styles.modalTitle}>تحديث التقدم</Text>
              <Text style={styles.modalBookTitle}>{selectedBook?.title}</Text>
            </View>

            <View style={styles.totalPagesInfo}>
              <Text style={styles.totalPagesText}>
                عدد الصفحات: {selectedBook?.totalPages}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWithButtons}>
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
                  style={styles.minusButton}
                  onPress={() => {
                    const current = parseInt(newPagesRead) || 0;
                    const newValue = Math.max(0, current - 1);
                    setNewPagesRead(newValue.toString());
                  }}
                >
                  <Ionicons name="remove" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateBookProgress}
              >
                <Text style={styles.updateButtonText}>تحديث</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setProgressModalVisible(false);
                  setSelectedBook(null);
                  setNewPagesRead("");
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
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
              <Ionicons name="trash" size={24} color="#F44336" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل الكتاب</Text>
              <Text style={styles.modalBookTitle}>{bookToEdit?.title}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>صورة الغلاف:</Text>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickEditImage}
              >
                {editForm.cover ? (
                  <Image
                    source={{ uri: editForm.cover }}
                    style={styles.selectedImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#666666" />
                    <Text style={styles.imagePlaceholderText}>
                      اختر صورة الغلاف
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>عنوان الكتاب:</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editForm.title}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, title: text }))
                }
                placeholder="أدخل عنوان الكتاب"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>إجمالي الصفحات:</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editForm.totalPages}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, totalPages: text }))
                }
                keyboardType="numeric"
                placeholder="أدخل إجمالي الصفحات"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleEditBook}
              >
                <Text style={styles.updateButtonText}>حفظ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setBookToEdit(null);
                  setEditForm({
                    title: "",
                    totalPages: "",
                    status: "to-read",
                    cover: "",
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
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
        title="حذف الكتاب"
        message={`هل أنت متأكد من حذف "${bookToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        icon="trash-outline"
      />

      {/* Validation Modal */}
      <ConfirmModal
        visible={validationModalVisible}
        onClose={() => setValidationModalVisible(false)}
        onConfirm={() => setValidationModalVisible(false)}
        title="خطأ في التحقق"
        message={validationMessage}
        confirmText="حسناً"
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
        title="إعادة تعيين التقدم"
        message={`تحاول تعيين إجمالي الصفحات إلى ${pendingEditData?.totalPages}، لكنك قرأت بالفعل ${bookToEdit?.pagesRead} صفحة. سيؤدي هذا إلى إعادة تعيين تقدم القراءة إلى 0 صفحة.`}
        confirmText="إعادة تعيين التقدم"
        cancelText="إلغاء"
        type="danger"
        icon="warning-outline"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    paddingTop: designTokens.spacing["6xl"],
    paddingBottom: designTokens.spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingBottom: designTokens.spacing.xl,
  },
  title: {
    ...textStyles.semibold3xl,
    color: colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  section: {
    marginVertical: designTokens.spacing.lg,
  },
  sectionTitle: {
    ...textStyles.semibold2xl,
    color: colors.text.primary,
    marginHorizontal: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.md,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: designTokens.spacing.lg,
    justifyContent: "space-between",
    gap: designTokens.spacing.base,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: designTokens.spacing["4xl"],
    marginHorizontal: designTokens.spacing.lg,
  },
  emptyText: {
    ...textStyles.regularLg,
    color: colors.text.light,
    marginTop: designTokens.spacing.base,
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: -50,
    left: 0,
    right: 0,
    bottom: -50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.sizes.modal.padding,
    margin: designTokens.spacing.xl,
    width: "90%",
    maxWidth: 400,
    ...designTokens.shadows.xl,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: designTokens.spacing.lg,
  },
  modalIconContainer: {
    marginBottom: designTokens.spacing.sm,
  },
  modalTitle: {
    ...textStyles.semiboldXl,
    color: colors.text.primary,
    textAlign: "center",
  },
  modalBookTitle: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: designTokens.spacing.base,
  },

  totalPagesInfo: {
    alignItems: "center",
    marginBottom: designTokens.spacing.md,
  },
  totalPagesLabel: {
    ...textStyles.regularSm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  totalPagesText: {
    ...textStyles.semiboldXl,
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: designTokens.spacing["2xl"],
  },
  inputLabel: {
    ...textStyles.semiboldLg,
    color: colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  modalInput: {
    flex: 1,
    padding: designTokens.sizes.input.paddingHorizontal,
    // ...textStyles.semiboldXl,
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center",
  },
  inputWithButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.secondary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minusButton: {
    paddingHorizontal: designTokens.sizes.button.paddingHorizontal,
    paddingVertical: designTokens.sizes.button.paddingVertical,
  },
  plusButton: {
    paddingHorizontal: designTokens.sizes.button.paddingHorizontal,
    paddingVertical: designTokens.sizes.button.paddingVertical,
  },
  modalButtons: {
    flexDirection: "row",
    gap: designTokens.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: designTokens.sizes.button.paddingVertical,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.primary,
    alignItems: "center",
  },
  cancelButtonText: {
    ...textStyles.semiboldBase,
    color: colors.text.secondary,
  },
  updateButton: {
    flex: 1,
    padding: designTokens.sizes.button.paddingVertical,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  updateButtonText: {
    ...textStyles.semiboldBase,
    color: colors.background.primary,
  },
  modalTextInput: {
    padding: designTokens.sizes.input.paddingHorizontal,
    color: colors.text.primary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.primary,
    textAlignVertical: "center",
  },
  deleteButton: {
    flex: 1,
    padding: designTokens.sizes.button.paddingVertical,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  deleteButtonText: {
    ...textStyles.semiboldBase,
    color: colors.background.primary,
  },
  floatingDeleteButton: {
    position: "absolute",
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imagePickerButton: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  imagePlaceholderText: {
    ...textStyles.regularSm,
    color: colors.text.secondary,
    marginTop: designTokens.spacing.sm,
  },
  selectedImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
});
