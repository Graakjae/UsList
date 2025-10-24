import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Button from "../ui/Button";

export default function EmptyState({ onAddProduct }) {
  const { t } = useTranslation();

  return (
    <View style={styles.emptyContainer}>
      <FontAwesomeIcon icon={faPlus} size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>{t("products.noOwnProducts")}</Text>
      <Text style={styles.emptyDescription}>
        {t("products.noOwnProductsDescription")}
      </Text>
      <Button variant="primary" onPress={onAddProduct} icon={faPlus}>
        {t("products.addFirstProduct")}
      </Button>
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
});
