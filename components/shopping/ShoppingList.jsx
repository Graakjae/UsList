import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  findNodeHandle,
} from "react-native";

export default function ShoppingList({
  sortedItems,
  toggleItem,
  currentListId,
  setShowAddListModal,
  editingItemId,
  editingItemName,
  setEditingItemName,
  startEditingItem,
  saveEditedItem,
  cancelEditingItem,
  editSearchResults,
  showEditResults,
  handleEditSearch,
  selectEditProduct,
}) {
  const { t } = useTranslation();
  const [inputLayout, setInputLayout] = useState(null);
  const itemRefs = useRef({});
  const flatListRef = useRef(null);

  const measureEditingItemPosition = () => {
    if (editingItemId && itemRefs.current[editingItemId]) {
      const nodeHandle = findNodeHandle(itemRefs.current[editingItemId]);
      if (nodeHandle) {
        itemRefs.current[editingItemId].measure(
          (x, y, width, height, pageX, pageY) => {
            setInputLayout({ x: pageX, y: pageY, width, height });
          }
        );
      }
    }
  };

  // Measure position when editingItemId changes
  useEffect(() => {
    if (editingItemId) {
      // Small delay to ensure the item is rendered
      setTimeout(measureEditingItemPosition, 100);
    } else {
      setInputLayout(null);
    }
  }, [editingItemId]);

  if (!currentListId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t("shopping.createListToStart")}</Text>
        <TouchableOpacity
          style={styles.createListButton}
          onPress={() => setShowAddListModal(true)}
        >
          <Text style={styles.createListButtonText}>
            {t("shopping.createList")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isEditing = editingItemId === item.id;

    return (
      <View
        style={styles.noteLine}
        ref={(ref) => {
          if (ref) {
            itemRefs.current[item.id] = ref;
          }
        }}
      >
        <View style={styles.holeMargin}>
          <View style={styles.hole} />
        </View>

        <TouchableOpacity
          style={isEditing ? styles.editItem : styles.item}
          onPress={() => toggleItem(item.id)}
          onLongPress={() => startEditingItem(item)}
          disabled={isEditing}
        >
          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.editInputContainer}>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      color: item.color || "#333",
                      fontFamily: item.font || "Baloo2-Bold",
                    },
                  ]}
                  value={editingItemName}
                  onChangeText={handleEditSearch}
                  onSubmitEditing={saveEditedItem}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Escape") {
                      cancelEditingItem();
                    }
                  }}
                  autoFocus
                  selectTextOnFocus
                  returnKeyType="done"
                  blurOnSubmit={false}
                  placeholder={t("shopping.editItemName")}
                />
              </View>
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={saveEditedItem}
                >
                  <FontAwesomeIcon icon={faCheck} size={14} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={cancelEditingItem}
                >
                  <FontAwesomeIcon icon={faTimes} size={14} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.itemText,
                  {
                    color: item.color || "#333",
                    fontFamily: item.font || "Baloo2-Bold",
                  },
                  item.completed && styles.completedText,
                ]}
              >
                {item.name}
              </Text>
              {item.icon_url && (
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
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedItems}
        style={styles.listContainer}
        keyExtractor={(item) => `item_${item.id}_${item.name}`}
        renderItem={renderItem}
      />
      {showEditResults && editSearchResults.length > 0 && inputLayout && (
        <View
          style={[
            styles.editSearchResultsContainer,
            {
              position: "absolute",
              top: inputLayout.y + inputLayout.height - 200,
              left: inputLayout.x + 8,
              width: inputLayout.width - 116,
            },
          ]}
        >
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
                <Text style={styles.editSearchResultText}>{product.name}</Text>
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
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    position: "relative",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#fff89d",
    marginBottom: 60,
  },
  noteLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff89d",
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1d96b",
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
  editItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    paddingRight: 12,
    paddingLeft: 4,
  },
  itemText: {
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "red",
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
    fontFamily: "Nunito-Bold",
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
    fontFamily: "Nunito-Bold",
    color: "white",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  editInputContainer: {
    flex: 1,
    position: "relative",
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#FFC0CB",
    borderRadius: 6,
    backgroundColor: "white",
    marginRight: 8,
  },
  editSearchResultsContainer: {
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  editButtons: {
    flexDirection: "row",
    gap: 4,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
};
