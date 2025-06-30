import {
  faListCheck,
  faRectangleList,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFC0CB",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Indkøbsliste",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faRectangleList} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="todos"
        options={{
          title: "Todo liste",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faListCheck} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
