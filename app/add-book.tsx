import { Ionicons } from "@expo/vector-icons";
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCover(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
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

    if (!cover.trim()) {
      showValidationError("يرجى اختيار صورة غلاف لكتابك.");
      return;
    }

    setIsSubmitting(true);

    try {
      database.addBook({
        title: title.trim(),
        cover: cover.trim(),
        totalPages: Number(totalPages),
        pagesRead: 0,
        status: "to-read",
      });

      setTitle("");
      setCover("");
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
                  <Ionicons name="camera" size={32} color="#666666" />
                  <Text style={styles.imagePlaceholderText}>
                    اختر صورة الغلاف
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
    paddingVertical: designTokens.spacing.xl,
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
    height: designTokens.sizes.image.placeholder.height,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    height: designTokens.sizes.image.placeholder.height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  imagePlaceholderText: {
    ...textStyles.regularLg,
    color: colors.text.secondary,
    marginTop: designTokens.spacing.base,
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
