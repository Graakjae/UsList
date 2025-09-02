import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import ListIcon from "@/components/ListIcon";
import ProfileIcon from "@/components/ProfileIcon";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFC0CB",
        headerShown: false,
        headerMode: "none",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("navigation.shoppingList"),
          headerShown: false,
          headerMode: "none",
          tabBarIcon: ({ color }) => <ListIcon color={color} size={30} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t("navigation.profile"),
          headerShown: false,
          tabBarIcon: ({ color }) => <ProfileIcon color={color} size={30} />,
        }}
      />
    </Tabs>
  );
}
