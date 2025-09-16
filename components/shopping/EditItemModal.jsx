import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import {
  getCategoriesForLanguage,
  getTranslatedCategoryName,
} from "../../utils/shoppingUtils";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

export default function EditItemModal({
  visible,
  editingItemName,
  handleEditSearch,
  saveEditedItem,
  cancelEditingItem,
  editSearchResults,
  showEditResults,
  selectEditProduct,
  item,
  selectedCategory,
  setSelectedCategory,
}) {
  const { t, i18n } = useTranslation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Get available categories
  const availableCategories = getCategoriesForLanguage(i18n.language);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelEditingItem}
      title={t("shopping.editItem")}
      onClose={cancelEditingItem}
      buttons={[
        {
          text: t("shopping.cancel"),
          style: { backgroundColor: "#f0f0f0" },
          onPress: cancelEditingItem,
        },
        {
          text: t("shopping.save"),
          style: { backgroundColor: "#FFC0CB" },
          textStyle: { color: "#fff" },
          onPress: () => saveEditedItem(selectedCategory),
        },
      ]}
    >
      <View style={styles.modalContainer}>
        <View style={styles.editContainer}>
          <View style={styles.editInputContainer}>
            <Text style={styles.editInputLabel}>{t("shopping.itemName")}</Text>
            <Input
              value={editingItemName}
              onChangeText={handleEditSearch}
              placeholder={t("shopping.itemName")}
              maxLength={50}
            />

            {showEditResults && editSearchResults.length > 0 && (
              <View style={styles.editSearchResultsContainer}>
                <FlatList
                  data={editSearchResults}
                  keyExtractor={(product) =>
                    `edit_search_${product.id}_${product.name}`
                  }
                  renderItem={({ item: product }) => (
                    <TouchableOpacity
                      style={styles.editSearchResultItem}
                      onPress={() => selectEditProduct(product)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editSearchResultText}>
                        {product.name}
                      </Text>
                      {product.icon_url && (
                        <Image
                          source={
                            product.icon_url.startsWith("data:")
                              ? { uri: product.icon_url }
                              : {
                                  uri: `data:image/png;base64,${
                                    product.icon_url.split(",")[1]
                                  }`,
                                }
                          }
                          style={styles.editProductImage}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}

            {/* Category Selector */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>
                {t("shopping.selectCategory")}
              </Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryButtonText}>
                  {selectedCategory
                    ? getTranslatedCategoryName(selectedCategory, i18n.language)
                    : t("shopping.noCategory")}
                </Text>
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.categoryDropdown}>
                  <FlatList
                    data={availableCategories}
                    keyExtractor={(category) => category.key}
                    renderItem={({ item: category }) => (
                      <TouchableOpacity
                        style={styles.categoryOption}
                        onPress={() => {
                          setSelectedCategory(category.key);
                          setShowCategoryDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.categoryOptionText}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "top",
    paddingTop: 200,
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 8,
  },

  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  editInputContainer: {
    flex: 1,
    position: "relative",
  },
  editInputLabel: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Regular",
    marginBottom: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: "#FFC0CB",
    borderRadius: 6,
    backgroundColor: "white",
    marginRight: 8,
    height: 32,
  },

  editSearchResultsContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editSearchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editSearchResultText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Regular",
  },
  editProductImage: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  categoryContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Medium",
    marginBottom: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#FFC0CB",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Nunito-Regular",
  },
  categoryDropdown: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
    zIndex: 1000,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Nunito-Regular",
  },
};
