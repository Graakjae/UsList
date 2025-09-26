import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EmptyState({ onAddProduct }) {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <FontAwesomeIcon icon={faPlus} size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>{t("products.noOwnProducts")}</Text>
      <Text style={styles.emptyDescription}>
        {t("products.noOwnProductsDescription")}
      </Text>
      <TouchableOpacity style={styles.emptyAddButton} onPress={onAddProduct}>
        <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
        <Text style={styles.emptyAddButtonText}>
          {t("products.addFirstProduct")}
        </Text>
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
    color: "#000",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
  },
});
