import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProductTabs({ activeTab, setActiveTab }) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "user" && styles.activeTab]}
        onPress={() => setActiveTab("user")}
      >
        <Text
          style={[styles.tabText, activeTab === "user" && styles.activeTabText]}
        >
          Mine produkter
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "standard" && styles.activeTab]}
        onPress={() => setActiveTab("standard")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "standard" && styles.activeTabText,
          ]}
        >
          Standardprodukter
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#FFC0CB",
    borderWidth: 2,
    borderColor: "#fff",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Baloo2-Bold",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
});
