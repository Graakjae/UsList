import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProductItem({
  product,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) {
  return (
    <View style={styles.productItem}>
      {product.icon_url && (
        <Image source={{ uri: product.icon_url }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        {product.subcategory && (
          <Text style={styles.productSubcategory}>{product.subcategory}</Text>
        )}
      </View>
      <View style={styles.productActions}>
        {canEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(product)}
          >
            <FontAwesomeIcon icon={faEdit} size={12} color="#333" />
            <Text style={styles.actionButtonText}>Rediger</Text>
          </TouchableOpacity>
        )}
        {canDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(product)}
          >
            <FontAwesomeIcon icon={faTrash} size={12} color="#333" />
            <Text style={styles.actionButtonText}>Slet</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    marginBottom: -2,
  },
  productCategory: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Baloo2-Regular",
  },
  productSubcategory: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Baloo2-Regular",
  },
  productActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  editButton: {},
  deleteButton: {},
  actionButtonText: {
    color: "#333",
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
  },
  productImage: {
    width: 35,
    height: 35,
    marginRight: 12,
    padding: 5,
  },
});
