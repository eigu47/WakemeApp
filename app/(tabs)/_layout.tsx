import { SafeAreaView } from "react-native-safe-area-context";

import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useGetColor } from "../../constants/Colors";

export default function TabLayout() {
  const { primary } = useGetColor();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: primary,
          tabBarShowLabel: false,
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
    </SafeAreaView>
  );
}
