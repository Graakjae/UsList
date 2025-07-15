import {
  faBasketShopping,
  faRectangleList,
  faUser,
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
        headerMode: "none",
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Indkøbsliste",
          headerShown: false,
          headerMode: "none",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faRectangleList} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Produkter",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faBasketShopping} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUser} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
