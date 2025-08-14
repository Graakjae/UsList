import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import CategorySelector from "./CategorySelector";

export default function ProductModal({
  visible,
  onClose,
  onSave,
  editingProduct,
  productName,
  setProductName,
  productCategory,
  setProductCategory,
  productSubcategory,
  setProductSubcategory,
  uploading,
  onChooseImage,
  newImage,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={
        editingProduct ? t("products.editProduct") : t("products.addMyProduct")
      }
      buttons={[
        {
          text: t("common.cancel"),
          style: { backgroundColor: "#f0f0f0" },
          onPress: onClose,
          disabled: uploading,
        },
        {
          text: uploading ? t("common.loading") : t("common.save"),
          style: { backgroundColor: "#FFC0CB" },
          textStyle: { color: "#fff" },
          onPress: onSave,
          disabled: uploading,
        },
      ]}
      animationType="fade"
      transparent={true}
      contentStyle={styles.modalContent}
    >
      <TouchableOpacity
        style={styles.imagePickerButton}
        onPress={onChooseImage}
      >
        {newImage ? (
          <Image source={{ uri: newImage }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesomeIcon icon={faPlus} size={24} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>
              {t("products.selectImage")}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Input
        value={productName}
        onChangeText={setProductName}
        placeholder={t("products.productName")}
      />

      <CategorySelector
        selectedCategory={productCategory}
        onCategorySelect={setProductCategory}
        placeholder={t("products.category")}
      />

      <Input
        value={productSubcategory}
        onChangeText={setProductSubcategory}
        placeholder={t("products.subcategory")}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },

  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "center",
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imagePlaceholderText: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
});
