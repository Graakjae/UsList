import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={cancelEditingItem}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={cancelEditingItem}
        activeOpacity={1}
      >
        <View style={styles.modalContainer}>
          <View style={styles.editContainer}>
            <View style={styles.editInputContainer}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: item?.color || "#333",
                    fontFamily: item?.font || "Baloo2-Medium",
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
                blurOnSubmit={true}
                placeholder={t("shopping.editItemName")}
              />
            </View>
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={saveEditedItem}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faCheck} size={14} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={cancelEditingItem}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faTimes} size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

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
        </View>
      </TouchableOpacity>
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
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  editInputContainer: {
    flex: 1,
    position: "relative",
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
  editSearchResultsContainer: {
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
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
};
