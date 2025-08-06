import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({ onAddProduct }) {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesomeIcon icon={faPlus} size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>Ingen egne produkter endnu</Text>
      <Text style={styles.emptyDescription}>
        Her kan du oprette dine egne produkter for at de dukker op i søgefeltet
        ude på dine lister
      </Text>
      <TouchableOpacity style={styles.emptyAddButton} onPress={onAddProduct}>
        <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
        <Text style={styles.emptyAddButtonText}>Tilføj dit første produkt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: "Baloo2-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: "#FFC0CB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
  },
});
