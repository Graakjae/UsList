import { ref, remove, update } from "firebase/database";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard } from "react-native";
import { database } from "../firebase";
import {
  getItemPath,
  getItemsPath,
  getSuggestedCategory,
  getTranslatedText,
  updateCategoryMemory,
} from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useListItems(
  currentListId,
  products,
  userListColor,
  userListFont,
  productCategories = []
) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // State
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editSearchResults, setEditSearchResults] = useState([]);
  const [showEditResults, setShowEditResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [showDeleteCompletedModal, setShowDeleteCompletedModal] =
    useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Helper function to get category name from category_id
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !productCategories.length) return null;
    const category = productCategories.find((cat) => cat.id === categoryId);
    return category ? category.label || category.name : null;
  };

  // Search function for editing
  const handleEditSearch = (text) => {
    setEditingItemName(text);
    if (text.length > 0) {
      const filtered = products.filter((product) => {
        const productName = getTranslatedText(product, "name", i18n.language);
        return (
          productName && productName.toLowerCase().includes(text.toLowerCase())
        );
      });
      setEditSearchResults(filtered.slice(0, 5));
      setShowEditResults(true);

      // Auto-update category if there's an exact match
      const exactMatch = products.find((product) => {
        const productName = getTranslatedText(product, "name", i18n.language);
        return productName && productName.toLowerCase() === text.toLowerCase();
      });
      if (exactMatch && exactMatch.category_id) {
        const categoryName = getCategoryNameById(exactMatch.category_id);
        if (categoryName) {
          setSelectedCategory(categoryName);
          setShowEditResults(false);
        }
      }
    } else {
      setEditSearchResults([]);
      setShowEditResults(false);
    }
  };

  // Select product from edit search results
  const selectEditProduct = (product) => {
    const productName = getTranslatedText(product, "name", i18n.language);
    setEditingItemName(productName);
    if (product.category_id) {
      const categoryName = getCategoryNameById(product.category_id);
      setSelectedCategory(categoryName || "");
    } else {
      setSelectedCategory("");
    }
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

    // Find product by product_id and get name in correct language
    const product = item.product_id
      ? products.find((p) => p.id === item.product_id)
      : null;
    const displayName = product
      ? getTranslatedText(product, "name", i18n.language)
      : item.name || "";

    setEditingItemName(displayName);

    // Get category name from category_id
    let categoryName = "";
    if (item.category_id) {
      categoryName = getCategoryNameById(item.category_id) || "";
    }
    setSelectedCategory(categoryName);

    setQuantity(item.quantity || "");
    setSelectedUnit(item.unit || "");
    setSelectedStore(item.store || "");

    // Get suggested category from memory (use displayName for lookup)
    if (user && displayName) {
      try {
        const suggestedCategory = await getSuggestedCategory(
          user.uid,
          displayName
        );
        // suggestedCategory is now category_id (or legacy category name)
        if (suggestedCategory && !categoryName) {
          if (suggestedCategory.startsWith("cat-")) {
            // It's a category_id - convert to category name for display
            const suggestedCategoryName =
              getCategoryNameById(suggestedCategory);
            if (suggestedCategoryName) {
              setSelectedCategory(suggestedCategoryName);
            }
          } else {
            // Legacy category name - use directly
            setSelectedCategory(suggestedCategory);
          }
        }
      } catch (error) {
        console.error("Error getting suggested category:", error);
      }
    }
  };

  // Helper function to convert category name to category_id
  const getCategoryIdFromName = (categoryName) => {
    if (!categoryName || !productCategories.length) return null;
    const category = productCategories.find(
      (cat) => (cat.label || cat.name) === categoryName
    );
    return category ? category.id : null;
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
      const matchingProduct = products.find((product) => {
        const productName = getTranslatedText(product, "name", i18n.language);
        return (
          productName &&
          productName.toLowerCase() === editingItemName.trim().toLowerCase()
        );
      });

      const itemPath = getItemPath(user, currentListId, editingItemId);
      if (!itemPath) return; // No valid path

      const itemRef = ref(database, itemPath);
      const finalItemName = matchingProduct
        ? getTranslatedText(matchingProduct, "name", i18n.language)
        : editingItemName.trim();

      // Convert category name to category_id
      let finalCategoryId = null;
      if (category) {
        // Category is provided as name, convert to id
        finalCategoryId = getCategoryIdFromName(category);
      } else if (matchingProduct && matchingProduct.category_id) {
        finalCategoryId = matchingProduct.category_id;
      }

      const updateData = {
        name: finalItemName,
        product_id: matchingProduct ? matchingProduct.id : null,
        category_id: finalCategoryId,
        subcategory_id: matchingProduct
          ? matchingProduct.subcategory_id || null
          : null,
        quantity: itemQuantity || quantity || "",
        unit: itemUnit || selectedUnit || "",
        store: selectedStore || "",
      };

      // Only add icon_url if product matches
      if (matchingProduct && matchingProduct.icon_url) {
        updateData.icon_url = matchingProduct.icon_url;
      } else {
        updateData.icon_url = null;
      }

      // Save category memory if category is provided (using category_id)
      if (finalCategoryId && finalItemName) {
        try {
          await updateCategoryMemory(user.uid, finalItemName, finalCategoryId);
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
          setSelectedStore("");
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
    setSelectedStore("");
    setEditSearchResults([]);
    setShowEditResults(false);
  };

  // Delete completed items
  const deleteCompletedItems = () => {
    if (!user || !currentListId) return;

    const completedItems = items.filter((item) => item.completed);
    completedItems.forEach((item) => {
      const itemPath = getItemPath(user, currentListId, item.id);
      if (itemPath) {
        const itemRef = ref(database, itemPath);
        remove(itemRef);
      }
    });
  };

  // Delete all items
  const deleteAllItems = () => {
    if (!user || !currentListId) return;

    const itemsPath = getItemsPath(user, currentListId);
    if (itemsPath) {
      const itemsRef = ref(database, itemsPath);
      remove(itemsRef);
    }
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
    selectedStore,
    setSelectedStore,
    showDeleteCompletedModal,
    setShowDeleteCompletedModal,
    showDeleteAllModal,
    setShowDeleteAllModal,
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
