import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs } from "expo-router";
import { fonts } from "../lib/fonts";
import { designTokens } from "../lib/styles";

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
        tabBarActiveTintColor: designTokens.colors.primary,
        tabBarInactiveTintColor: designTokens.colors.text.light,
        tabBarStyle: {
          backgroundColor: designTokens.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: designTokens.colors.border,
          paddingBottom: designTokens.spacing.xl,
          paddingTop: designTokens.spacing.sm,
          height: 80,
          ...designTokens.shadows.sm,
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
