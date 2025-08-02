import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs } from "expo-router";
import { fonts } from "../lib/fonts";

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    [fonts.regular]: require("../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    [fonts.semibold]: require("../assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
  });

  // Hide the navigation bar
  NavigationBar.setVisibilityAsync("hidden");

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6147E5",
        tabBarInactiveTintColor: "#8A8A8A",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 24,
          paddingTop: 8,
          height: 80,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        headerShown: false, // Hide all page headers
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 13,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "المكتبة",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-book"
        options={{
          title: "إضافة كتاب",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "الملف الشخصي",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
