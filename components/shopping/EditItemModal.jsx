import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import {
  getAvailableStores,
  getAvailableUnits,
  getCategoriesForLanguage,
} from "../../utils/shoppingUtils";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Selector from "../ui/Selector";
import { SelectorProvider } from "../ui/SelectorContext";

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
  quantity,
  setQuantity,
  selectedUnit,
  setSelectedUnit,
  selectedStore,
  setSelectedStore,
}) {
  const { t, i18n } = useTranslation();

  // Get available categories, units and stores
  const availableCategories = getCategoriesForLanguage(i18n.language);
  const availableUnits = getAvailableUnits();
  const availableStores = getAvailableStores();

  return (
    <SelectorProvider>
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
            style: { backgroundColor: "#f0f0f0", zIndex: -1 },
            onPress: cancelEditingItem,
          },
          {
            text: t("shopping.save"),
            style: { backgroundColor: "#FFC0CB", zIndex: -1 },
            textStyle: { color: "#fff" },
            onPress: () =>
              saveEditedItem(
                selectedCategory,
                quantity,
                selectedUnit,
                selectedStore
              ),
          },
        ]}
      >
        <View style={styles.modalContainer}>
          <View style={styles.editContainer}>
            <View style={styles.editInputContainer}>
              <Text style={styles.editInputLabel}>
                {t("shopping.itemName")}
              </Text>
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
              <Selector
                id="category"
                label={t("shopping.selectCategory")}
                value={selectedCategory}
                options={availableCategories}
                onSelect={(category) => {
                  setSelectedCategory(category.key);
                }}
                placeholder={t("shopping.noCategory")}
                style={styles.categoryContainer}
              />

              {/* Quantity and Unit Selector */}
              <View style={styles.quantityUnitContainer}>
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>
                    {t("shopping.quantity")}
                  </Text>
                  <Input
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="1"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.unitContainer}>
                  <Selector
                    id="unit"
                    label={t("shopping.unit")}
                    value={selectedUnit}
                    options={availableUnits}
                    onSelect={(unit) => {
                      setSelectedUnit(unit.key);
                    }}
                    placeholder={t("shopping.noUnit")}
                  />
                </View>
              </View>

              {/* Store selector */}
              <Selector
                id="store"
                label={t("shopping.store")}
                value={selectedStore}
                options={availableStores}
                onSelect={(store) => {
                  setSelectedStore(store.key);
                }}
                placeholder={t("shopping.noStore")}
                style={styles.storeContainer}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SelectorProvider>
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
    width: "100%",
    backgroundColor: "white",
  },

  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 4,
  },
  editInputContainer: {
    flex: 1,
    position: "relative",
    overflow: "visible",
  },
  editInputLabel: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Bold",
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

  quantityUnitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quantityContainer: {
    flex: 1,
    marginRight: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Bold",
    marginBottom: 8,
  },

  unitContainer: {
    flex: 1,
    marginLeft: 8,
    position: "relative",
    overflow: "visible",
  },
  storeContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "visible",
  },
  categoryContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "visible",
  },
};
