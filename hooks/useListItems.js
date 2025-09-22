import { ref, remove, update } from "firebase/database";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard } from "react-native";
import { database } from "../firebase";
import {
  getItemPath,
  getItemsPath,
  getSuggestedCategory,
  updateCategoryMemory,
} from "../utils/shoppingUtils";
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

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
    Keyboard.dismiss();
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
  const startEditingItem = async (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setSelectedCategory(item.category || "");
    setQuantity(item.quantity || "");
    setSelectedUnit(item.unit || "");

    // Get suggested category from memory
    if (user && item.name) {
      try {
        const suggestedCategory = await getSuggestedCategory(
          user.uid,
          item.name
        );
        if (suggestedCategory && !item.category) {
          setSelectedCategory(suggestedCategory);
        }
      } catch (error) {
        console.error("Error getting suggested category:", error);
      }
    }
  };

  // Save edited item (with optional category, quantity, and unit)
  const saveEditedItem = async (
    category = null,
    itemQuantity = null,
    itemUnit = null
  ) => {
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
      const finalItemName = matchingProduct
        ? matchingProduct.name
        : editingItemName.trim();

      // Use provided category, or fall back to product category, or empty
      let finalCategory = "";
      if (category) {
        finalCategory = category;
      } else if (matchingProduct) {
        finalCategory = matchingProduct.category || "";
      }

      const updateData = {
        name: finalItemName,
        category: finalCategory,
        quantity: itemQuantity || quantity || "",
        unit: itemUnit || selectedUnit || "",
      };

      // Only add subcategory and icon_url if product matches
      if (matchingProduct) {
        updateData.subcategory = matchingProduct.subcategory || "";
        if (matchingProduct.icon_url) {
          updateData.icon_url = matchingProduct.icon_url;
        }
      } else {
        // Remove subcategory and icon_url if no matching product
        updateData.subcategory = "";
        updateData.icon_url = null;
      }

      // Save category memory if category is provided
      if (category && finalItemName) {
        try {
          await updateCategoryMemory(user.uid, finalItemName, category);
        } catch (memoryError) {
          console.error("Error saving category memory:", memoryError);
          // Don't fail the main operation if memory saving fails
        }
      }

      update(itemRef, updateData)
        .then(() => {
          setEditingItemId(null);
          setEditingItemName("");
          setSelectedCategory("");
          setQuantity("");
          setSelectedUnit("");
          setEditSearchResults([]);
          setShowEditResults(false);
        })
        .catch((error) => {
          console.error("Error updating item:", error);
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
    setSelectedCategory("");
    setQuantity("");
    setSelectedUnit("");
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
    selectedCategory,
    setSelectedCategory,
    quantity,
    setQuantity,
    selectedUnit,
    setSelectedUnit,

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
