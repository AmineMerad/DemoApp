import React from "react";
import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: "#16D1A6",
    tabBarInactiveTintColor: isDark ? "#bacac2" : "#6b7a74",
    tabBarStyle: {
      backgroundColor: isDark ? "#1a1f2f" : "#ffffff",
      borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#e0e3e5",
      borderTopWidth: 1,
      height: 56 + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "600" as const,
    },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }: { color: string }) => <MaterialCommunityIcons name="history" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
