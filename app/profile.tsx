import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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

  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to reset all your reading data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            try {
              database.resetData();

              // Update statistics immediately
              loadStatistics();

              Alert.alert("Success", "All data has been reset", [
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
              console.error("Error resetting data:", error);
              Alert.alert("Error", "Failed to reset data");
            }
          },
        },
      ]
    );
  };

  return (
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
          color="#2196F3"
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
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Text style={styles.cardSubtitle}>Manage your account and data</Text>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
          <Text style={styles.resetButtonText}>Reset Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
