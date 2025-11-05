import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { getCategoryIcon, getTranslatedText } from "../../utils/shoppingUtils";
import EditItemModal from "./EditItemModal";

export default function ShoppingList({
  sortedItems,
  toggleItem,
  currentListId,
  onCreateNewList,
  editingItemId,
  editingItemName,
  startEditingItem,
  saveEditedItem,
  cancelEditingItem,
  editSearchResults,
  showEditResults,
  setShowEditResults,
  handleEditSearch,
  selectEditProduct,
  selectedCategory,
  setSelectedCategory,
  quantity,
  setQuantity,
  selectedUnit,
  setSelectedUnit,
  selectedStore,
  setSelectedStore,
  getCategoryNameById,
  getSubcategoryNameById,
  products,
}) {
  const { t, i18n } = useTranslation();
  const flatListRef = useRef(null);

  if (!currentListId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("shopping.createListToStart")}</Text>
        <TouchableOpacity
          style={styles.createListButton}
          onPress={onCreateNewList}
        >
          <Text style={styles.createListButtonText}>
            {t("shopping.createList")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    // Find product by product_id
    const product = item.product_id
      ? products.find((p) => p.id === item.product_id)
      : null;

    // Get product name from product (in correct language) or fallback to item.name
    const displayName = product
      ? getTranslatedText(product, "name", i18n.language)
      : item.name || "";

    // Get category name from category_id (for display)
    const categoryName = item.category_id
      ? getCategoryNameById(item.category_id)
      : null;

    // Use product icon_url if available, otherwise use item icon_url
    const iconUrl = product?.icon_url || item.icon_url;

    return (
      <View style={[styles.noteLine]}>
        <TouchableOpacity
          style={styles.holeMargin}
          onPress={() => toggleItem(item.id)}
        >
          <View style={styles.hole}>
            {item.completed && (
              <FontAwesomeIcon
                icon={faCheck}
                size={12}
                color="#007806"
                style={styles.checkIcon}
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => startEditingItem(item)}
        >
          <View style={styles.itemTextContainer}>
            <Text
              style={[
                styles.itemText,
                {
                  color: item.color || "#333",
                  fontFamily: item.font || "Baloo2-Medium",
                },
                item.completed && styles.completedText,
                !categoryName && styles.noCategoryText,
              ]}
            >
              {displayName}
              {item?.quantity && `, ${item?.quantity} ${item?.unit}`}
            </Text>
            {item.store && (
              <Text
                style={[
                  styles.itemStoreText,
                  {
                    color: item.color || "#333",
                    fontFamily: item.font || "Baloo2-Medium",
                  },
                  item.completed && styles.completedText,
                ]}
              >
                {item.store}
              </Text>
            )}
          </View>
          <View style={styles.itemRightContent}>
            {iconUrl ? (
              <Image
                source={
                  iconUrl.startsWith("data:")
                    ? { uri: iconUrl }
                    : {
                        uri: `data:image/png;base64,${iconUrl.split(",")[1]}`,
                      }
                }
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={getCategoryIcon(item.category_id)}
                style={styles.categoryIcon}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Find the item being edited
  const editingItem = sortedItems.find((item) => item.id === editingItemId);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedItems}
        style={styles.listContainer}
        keyExtractor={(item) => {
          const product = item.product_id
            ? products.find((p) => p.id === item.product_id)
            : null;
          const displayName = product
            ? getTranslatedText(product, "name", i18n.language)
            : item.name || "";
          return `item_${item.id}_${displayName}`;
        }}
        renderItem={renderItem}
        keyboardShouldPersistTaps="never"
      />

      <EditItemModal
        visible={!!editingItemId}
        editingItemName={editingItemName}
        handleEditSearch={handleEditSearch}
        saveEditedItem={saveEditedItem}
        cancelEditingItem={cancelEditingItem}
        editSearchResults={editSearchResults}
        showEditResults={showEditResults}
        setShowEditResults={setShowEditResults}
        selectEditProduct={selectEditProduct}
        item={editingItem}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        quantity={quantity}
        setQuantity={setQuantity}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
      />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff89d",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1d96b",
    marginBottom: 48,
  },
  listContainer: {
    flex: 1,
    marginBottom: 0,
  },
  noteLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff89d",
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1d96b",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  holeMargin: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 12,
    paddingRight: 12,
    marginRight: 8,
  },
  hole: {
    width: 15,
    height: 15,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    marginTop: 1,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemRightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemText: {
    fontSize: 16,
    fontFamily: "Nunito-Medium",
    color: "#333",
  },
  itemStoreText: {
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#666",
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#707070",
  },

  categoryIcon: {
    fontSize: 20,
    width: 25,
    height: 25,
    textAlign: "center",
    lineHeight: 25,
  },
  productImage: {
    width: 25,
    height: 25,
    zIndex: 1000,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff89d",
    padding: 20,
    marginBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    fontFamily: "Nunito-Medium",
  },
  createListButton: {
    backgroundColor: "#FFC0CB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  createListButtonText: {
    fontSize: 16,
    fontFamily: "Nunito-Medium",
    color: "#000",
  },
};
