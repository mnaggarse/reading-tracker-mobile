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
import ProgressBar from "../components/ProgressBar";
import StatsCard from "../components/StatsCard";
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

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // In a real app, this would clear user session
          Alert.alert("Success", "Logged out successfully");
        },
      },
    ]);
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
              loadStatistics();
              Alert.alert("Success", "All data has been reset");
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>Reading Tracker</Text>
        <Text style={styles.userSubtitle}>Track your reading progress</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatsCard
          title="Books Completed"
          value={stats.completedBooks}
          subtitle="Total books finished"
          icon={<Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />}
          color="#4CAF50"
        />

        <StatsCard
          title="Pages Read"
          value={stats.totalPagesRead.toLocaleString()}
          subtitle="Total pages read"
          icon={<Ionicons name="trending-up" size={16} color="#FFFFFF" />}
          color="#2196F3"
        />

        <StatsCard
          title="Currently Reading"
          value={stats.currentlyReading}
          subtitle="Books in progress"
          icon={<Ionicons name="play-circle" size={16} color="#FFFFFF" />}
          color="#FF9800"
        />

        <StatsCard
          title="Total Books"
          value={stats.totalBooks}
          subtitle="Books in library"
          icon={<Ionicons name="library" size={16} color="#FFFFFF" />}
          color="#9C27B0"
        />
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

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <Text style={styles.resetButtonText}>Reset Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: "#666666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  logoutButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  resetButton: {
    flex: 1,
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
