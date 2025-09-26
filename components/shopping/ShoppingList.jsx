import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { getCategoryIcon } from "../../utils/shoppingUtils";
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
}) {
  const { t } = useTranslation();
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
    const isLastItem = index === sortedItems.length - 1;
    return (
      <View style={[styles.noteLine, isLastItem && styles.lastItem]}>
        <View style={styles.holeMargin}>
          <View style={styles.hole} />
        </View>

        <TouchableOpacity
          style={styles.item}
          onPress={() => toggleItem(item.id)}
          onLongPress={() => startEditingItem(item)}
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
                !item.category && styles.noCategoryText,
              ]}
            >
              {item.name}
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
            {item.icon_url ? (
              <Image
                source={
                  item.icon_url.startsWith("data:")
                    ? { uri: item.icon_url }
                    : {
                        uri: `data:image/png;base64,${
                          item.icon_url.split(",")[1]
                        }`,
                      }
                }
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={getCategoryIcon(item.category)}
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
        keyExtractor={(item) => `item_${item.id}_${item.name}`}
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
    marginBottom: 50,
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
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  hole: {
    width: 15,
    height: 15,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    color: "red",
  },
  noCategoryText: {
    fontStyle: "italic",
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
