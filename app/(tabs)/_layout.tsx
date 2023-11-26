import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { COLORS } from "../../constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: 40,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="code" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="code" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
