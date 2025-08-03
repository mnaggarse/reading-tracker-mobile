import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmModal from "../components/ConfirmModal";
import { database } from "../lib/database";
import { colors, designTokens, textStyles } from "../lib/styles";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [pdfPath, setPdfPath] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [validationType, setValidationType] = useState<"warning" | "info">(
    "warning"
  );

  const pickImage = async () => {
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
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCover(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const pickPdfFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPdfPath(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Error", "Failed to pick PDF file. Please try again.");
    }
  };

  const showValidationError = (
    message: string,
    type: "warning" | "info" = "warning"
  ) => {
    setValidationMessage(message);
    setValidationType(type);
    setValidationModalVisible(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      showValidationError("يرجى إدخال عنوان الكتاب للمتابعة.");
      return;
    }

    if (
      !totalPages.trim() ||
      isNaN(Number(totalPages)) ||
      Number(totalPages) <= 0
    ) {
      showValidationError(
        "يرجى إدخال عدد صحيح من الصفحات (يجب أن يكون أكبر من 0)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      database.addBook({
        title: title.trim(),
        cover: cover.trim() || "",
        pdfPath: pdfPath.trim() || "",
        totalPages: Number(totalPages),
        pagesRead: 0,
        status: "to-read",
      });

      setTitle("");
      setCover("");
      setPdfPath("");
      setTotalPages("");

      router.push({
        pathname: "/",
        params: { refresh: Date.now() },
      });
    } catch (error) {
      console.error("Error adding book:", error);
      showValidationError(
        "فشل في إضافة الكتاب. يرجى المحاولة مرة أخرى.",
        "warning"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>إضافة كتاب</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>صورة الغلاف</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              {cover ? (
                <Image source={{ uri: cover }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="book-outline" size={26} color="#666666" />
                  <Text style={styles.imagePlaceholderText}>
                    صورة الغلاف (اختياري)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ملف PDF</Text>
            <TouchableOpacity
              style={styles.pdfPickerButton}
              onPress={pickPdfFile}
            >
              {pdfPath ? (
                <View style={styles.pdfSelected}>
                  <Ionicons name="document" size={26} color={colors.primary} />
                  <Text style={styles.pdfSelectedText}>تم اختيار ملف PDF</Text>
                </View>
              ) : (
                <View style={styles.pdfPlaceholder}>
                  <Ionicons name="document-outline" size={26} color="#666666" />
                  <Text style={styles.pdfPlaceholderText}>
                    ملف PDF (اختياري)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>عنوان الكتاب</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="أدخل عنوان الكتاب"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>إجمالي الصفحات</Text>
              <TextInput
                style={styles.input}
                value={totalPages}
                onChangeText={setTotalPages}
                placeholder="أدخل إجمالي عدد الصفحات"
                placeholderTextColor="#999999"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "جاري الإضافة..." : "إضافة كتاب"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Validation Error Modal */}
      <ConfirmModal
        visible={validationModalVisible}
        onClose={() => setValidationModalVisible(false)}
        onConfirm={() => setValidationModalVisible(false)}
        title="معلومات مفقودة"
        message={validationMessage}
        confirmText="حسناً"
        type={validationType}
        icon="alert-circle-outline"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: designTokens.spacing["6xl"],
    padding: designTokens.spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingBottom: designTokens.spacing.xl,
  },
  headerTitle: {
    ...textStyles.semibold3xl,
    color: colors.text.primary,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: designTokens.spacing.xl,
  },
  label: {
    ...textStyles.semiboldLg,
    color: colors.text.primary,
    marginBottom: designTokens.spacing.base,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.sizes.input.paddingHorizontal,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: "IBMPlexSansArabic-SemiBold",
  },
  imagePickerButton: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 60,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    gap: designTokens.spacing.sm,
  },
  imagePlaceholderText: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
  },
  pdfPickerButton: {
    backgroundColor: colors.background.primary,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pdfSelected: {
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: designTokens.spacing.sm,
  },
  pdfSelectedText: {
    ...textStyles.regularLg,
    color: colors.primary,
  },
  pdfPlaceholder: {
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    gap: designTokens.spacing.sm,
  },
  pdfPlaceholderText: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.lg,
    alignItems: "center",
    marginTop: designTokens.spacing.xl,
    ...designTokens.shadows.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  submitButtonText: {
    color: colors.background.primary,
    ...textStyles.semiboldLg,
  },
});
