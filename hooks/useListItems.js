import { ref, remove, update } from "firebase/database";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import { getItemPath, getItemsPath } from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useListItems(
  currentListId,
  products,
  userListColor,
  userListFont
) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // State
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editSearchResults, setEditSearchResults] = useState([]);
  const [showEditResults, setShowEditResults] = useState(false);

  // Search function for editing
  const handleEditSearch = (text) => {
    setEditingItemName(text);
    if (text.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setEditSearchResults(filtered);
      setShowEditResults(true);
    } else {
      setEditSearchResults([]);
      setShowEditResults(false);
    }
  };

  // Select product from edit search results
  const selectEditProduct = (product) => {
    setEditingItemName(product.name);
    setEditSearchResults([]);
    setShowEditResults(false);
  };

  // Toggle item completion
  const toggleItem = (id) => {
    if (!user || !currentListId) return;

    const itemPath = getItemPath(user, currentListId, id);
    if (!itemPath) return; // No valid path

    const itemRef = ref(database, itemPath);
    const item = items.find((item) => item.id === id);
    if (item) {
      update(itemRef, {
        completed: !item.completed,
      });
    }
  };

  // Start editing item name
  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  // Save edited item name
  const saveEditedItem = () => {
    if (!user || !currentListId || !editingItemId || !editingItemName.trim())
      return;

    try {
      const matchingProduct = products.find(
        (product) =>
          product.name.toLowerCase() === editingItemName.trim().toLowerCase()
      );

      const itemPath = getItemPath(user, currentListId, editingItemId);
      if (!itemPath) return; // No valid path

      const itemRef = ref(database, itemPath);
      const updateData = {
        name: matchingProduct ? matchingProduct.name : editingItemName.trim(),
      };

      // Only add category, subcategory, and icon_url if product matches
      if (matchingProduct) {
        updateData.category = matchingProduct.category || "";
        updateData.subcategory = matchingProduct.subcategory || "";
        if (matchingProduct.icon_url) {
          updateData.icon_url = matchingProduct.icon_url;
        }
      } else {
        // Remove category, subcategory, and icon_url if no matching product
        updateData.category = "";
        updateData.subcategory = "";
        updateData.icon_url = null;
      }

      update(itemRef, updateData)
        .then(() => {
          setEditingItemId(null);
          setEditingItemName("");
          setEditSearchResults([]);
          setShowEditResults(false);
        })
        .catch((error) => {
          console.error("Error updating item name:", error);
          Alert.alert(t("shopping.error"), t("shopping.errorUpdatingItemName"));
        });
    } catch (error) {
      console.error("Error in saveEditedItem:", error);
      Alert.alert(t("shopping.error"), t("shopping.errorUpdatingItemName"));
    }
  };

  // Cancel editing item name
  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditingItemName("");
    setEditSearchResults([]);
    setShowEditResults(false);
  };

  // Delete completed items
  const deleteCompletedItems = () => {
    if (!user || !currentListId) return;

    Alert.alert(
      t("shopping.deleteCompleted"),
      t("shopping.deleteCompletedConfirm"),
      [
        { text: t("shopping.cancel"), style: "cancel" },
        {
          text: t("shopping.delete"),
          style: "destructive",
          onPress: () => {
            const completedItems = items.filter((item) => item.completed);
            completedItems.forEach((item) => {
              const itemPath = getItemPath(user, currentListId, item.id);
              if (itemPath) {
                const itemRef = ref(database, itemPath);
                remove(itemRef);
              }
            });
          },
        },
      ]
    );
  };

  // Delete all items
  const deleteAllItems = () => {
    if (!user || !currentListId) return;

    Alert.alert(t("shopping.deleteAll"), t("shopping.deleteAllConfirm"), [
      { text: t("shopping.cancel"), style: "cancel" },
      {
        text: t("shopping.delete"),
        style: "destructive",
        onPress: () => {
          const itemsPath = getItemsPath(user, currentListId);
          if (itemsPath) {
            const itemsRef = ref(database, itemsPath);
            remove(itemsRef);
          }
        },
      },
    ]);
  };

  return {
    // State
    items,
    setItems,
    editingItemId,
    setEditingItemId,
    editingItemName,
    setEditingItemName,
    editSearchResults,
    setEditSearchResults,
    showEditResults,
    setShowEditResults,

    // Functions
    handleEditSearch,
    selectEditProduct,
    toggleItem,
    startEditingItem,
    saveEditedItem,
    cancelEditingItem,
    deleteCompletedItems,
    deleteAllItems,
  };
}
