import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
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
import ConfirmModal from "../components/ConfirmModal";
import ProgressBar from "../components/ProgressBar";
import { database } from "../lib/database";

interface Statistics {
  totalBooks: number;
  completedBooks: number;
  currentlyReading: number;
  totalPagesRead: number;
  totalPagesGoal: number;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<Statistics>({
    totalBooks: 0,
    completedBooks: 0,
    currentlyReading: 0,
    totalPagesRead: 0,
    totalPagesGoal: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [importSuccessModalVisible, setImportSuccessModalVisible] =
    useState(false);
  const params = useLocalSearchParams();

  const loadStatistics = () => {
    try {
      const statistics = database.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error("Error loading statistics:", error);
      Alert.alert("Error", "Failed to load statistics");
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  // Listen for navigation parameters to trigger refresh
  useEffect(() => {
    if (params.refresh) {
      loadStatistics();
    }
  }, [params.refresh]);

  // Update statistics when profile page comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
    setRefreshing(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const fileUri = await database.exportData();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Reading Data",
        });
      } else {
        Alert.alert(
          "Export Complete",
          `Data exported successfully to: ${fileUri}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;

      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      // Import data
      await database.importData(fileContent);

      // Refresh statistics
      loadStatistics();

      setImportModalVisible(false);
      setImportSuccessModalVisible(true);
    } catch (error) {
      console.error("Error importing data:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to import data. Please try again."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetData = () => {
    try {
      database.resetData();

      // Update statistics immediately
      loadStatistics();

      setResetModalVisible(false);
      setSuccessMessage(
        "All your reading data has been successfully reset. Your library is now empty."
      );
      setSuccessModalVisible(true);
    } catch (error) {
      console.error("Error resetting data:", error);
      Alert.alert("Error", "Failed to reset data");
    }
  };

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
          <Text style={styles.userName}>Profile</Text>
        </View>

        <View style={styles.goalsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reading Goals</Text>
            <Text style={styles.cardSubtitle}>
              Your progress towards reading goals
            </Text>
          </View>

          <ProgressBar
            label="Books Completed"
            current={stats.completedBooks}
            total={stats.totalBooks}
            color="#3B82F6"
          />

          <ProgressBar
            label="Pages Read"
            current={stats.totalPagesRead}
            total={stats.totalPagesGoal}
            color="#4CAF50"
          />
        </View>

        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Data Management</Text>
            <Text style={styles.cardSubtitle}>
              Import, export, and manage your data
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <Text style={styles.actionButtonText}>
                {isExporting ? "Exporting..." : "Export Data"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.importButton]}
              onPress={() => setImportModalVisible(true)}
              disabled={isImporting}
            >
              <Text style={styles.actionButtonText}>
                {isImporting ? "Importing..." : "Import Data"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Danger Zone</Text>
            <Text style={styles.cardSubtitle}>
              Delete all your books and progress
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setResetModalVisible(true)}
          >
            <Text style={styles.resetButtonText}>Reset Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset Data Confirmation Modal */}
      <ConfirmModal
        visible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
        onConfirm={handleResetData}
        title="Reset All Data"
        message="Are you sure you want to reset all your reading data? This action cannot be undone and will permanently delete all your books and progress."
        confirmText="Reset All Data"
        cancelText="Cancel"
        type="danger"
        icon="warning-outline"
      />

      {/* Import Data Confirmation Modal */}
      <ConfirmModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onConfirm={handleImportData}
        title="Import Data"
        message="This will replace all your current reading data with the imported data. Are you sure you want to continue?"
        confirmText="Import Data"
        cancelText="Cancel"
        type="warning"
        icon="cloud-download-outline"
      />

      {/* Success Modal */}
      <ConfirmModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        onConfirm={() => {
          setSuccessModalVisible(false);
          // Navigate back to library with refresh parameter
          router.push({
            pathname: "/",
            params: { refresh: Date.now() },
          });
        }}
        title="Data Reset Complete"
        message={successMessage}
        confirmText="OK"
        type="success"
        icon="checkmark-circle-outline"
        showCancelButton={false}
      />

      {/* Import Success Modal */}
      <ConfirmModal
        visible={importSuccessModalVisible}
        onClose={() => setImportSuccessModalVisible(false)}
        onConfirm={() => {
          setImportSuccessModalVisible(false);
          // Navigate back to library with refresh parameter
          router.push({
            pathname: "/",
            params: { refresh: Date.now() },
          });
        }}
        title="Import Complete"
        message="Your reading data has been successfully imported! Your library has been updated with the imported books and progress."
        confirmText="OK"
        type="success"
        icon="cloud-download-outline"
        showCancelButton={false}
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
  header: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  goalsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  exportButton: {
    backgroundColor: "#3B82F6",
  },
  importButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F44336",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
