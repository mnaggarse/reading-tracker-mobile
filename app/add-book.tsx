import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { database } from "../lib/database";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [status, setStatus] = useState<"reading" | "to-read">("to-read");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a book title");
      return;
    }

    if (
      !totalPages.trim() ||
      isNaN(Number(totalPages)) ||
      Number(totalPages) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid number of pages");
      return;
    }

    if (!cover.trim()) {
      Alert.alert("Error", "Please enter a cover image URL");
      return;
    }

    setIsSubmitting(true);

    try {
      database.addBook({
        title: title.trim(),
        cover: cover.trim(),
        totalPages: Number(totalPages),
        pagesRead: status === "reading" ? 1 : 0,
        status,
      });

      Alert.alert("Success", "Book added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setCover("");
            setTotalPages("");
            setStatus("to-read");
            // Navigate back to library
            router.push("/");
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding book:", error);
      Alert.alert("Error", "Failed to add book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="add-circle" size={48} color="#2196F3" />
          <Text style={styles.headerTitle}>Add New Book</Text>
          <Text style={styles.headerSubtitle}>
            Enter the details of your new book
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Book Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter book title"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cover Image URL *</Text>
            <TextInput
              style={styles.input}
              value={cover}
              onChangeText={setCover}
              placeholder="Enter cover image URL"
              placeholderTextColor="#999999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Pages *</Text>
            <TextInput
              style={styles.input}
              value={totalPages}
              onChangeText={setTotalPages}
              placeholder="Enter total number of pages"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === "to-read" && styles.statusButtonActive,
                ]}
                onPress={() => setStatus("to-read")}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={status === "to-read" ? "#FFFFFF" : "#666666"}
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "to-read" && styles.statusButtonTextActive,
                  ]}
                >
                  To Read
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === "reading" && styles.statusButtonActive,
                ]}
                onPress={() => setStatus("reading")}
              >
                <Ionicons
                  name="play-outline"
                  size={20}
                  color={status === "reading" ? "#FFFFFF" : "#666666"}
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "reading" && styles.statusButtonTextActive,
                  ]}
                >
                  Start Reading
                </Text>
              </TouchableOpacity>
            </View>
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
              {isSubmitting ? "Adding..." : "Add Book"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 4,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  statusButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
