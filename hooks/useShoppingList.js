import AsyncStorage from "@react-native-async-storage/async-storage";
import { onValue, push, ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import {
  getCategoriesForLanguageFromDB,
  getItemsPath,
  getSuggestedCategory,
  getTranslatedText,
  hasItems as hasItemsUtil,
  isItemCompleted,
  updateCategoryMemory,
} from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";
import useInviteSystem from "./useInviteSystem";
import useListItems from "./useListItems";
import useListMembers from "./useListMembers";

export default function useShoppingList() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // Core state
  const [newItem, setNewItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [listsLoading, setListsLoading] = useState(true);
  const [showListDropdown, setShowListDropdown] = useState(false);

  // UI state
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [editListName, setEditListName] = useState("");
  const [userListColor, setUserListColor] = useState("#333");
  const [userListFont, setUserListFont] = useState("Baloo2-Medium");

  // Custom setCurrentListId that saves to AsyncStorage
  const setCurrentListIdWithSave = (listId) => {
    setCurrentListId(listId);
    saveLastSelectedList(listId);
  };

  // Save last selected list
  const saveLastSelectedList = async (listId) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`lastSelectedList_${user.uid}`, listId || "");
    } catch (error) {
      console.error("Error saving last selected list:", error);
    }
  };

  // Load last selected list
  const loadLastSelectedList = async () => {
    if (!user) return null;
    try {
      const lastListId = await AsyncStorage.getItem(
        `lastSelectedList_${user.uid}`
      );
      return lastListId || null;
    } catch (error) {
      console.error("Error loading last selected list:", error);
      return null;
    }
  };

  // Get available categories for current language
  const getAvailableCategories = () => {
    return productCategories;
  };

  // Get category options for dropdown/selection
  const getCategoryOptions = () => {
    return getAvailableCategories().map((cat) => ({
      label: cat.label,
      value: cat.label,
    }));
  };

  // Load product categories
  const loadProductCategories = async () => {
    try {
      const categories = await getCategoriesForLanguageFromDB(i18n.language);
      setProductCategories(categories);
    } catch (error) {
      console.error("Error loading product categories:", error);
      setProductCategories([]);
    }
  };

  // Helper function to get category name from category_id
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !productCategories.length) return null;
    const category = productCategories.find((cat) => cat.id === categoryId);
    return category ? category.label || category.name : null;
  };

  // Helper function to get subcategory name from subcategory_id
  const getSubcategoryNameById = (subcategoryId) => {
    if (!subcategoryId || !productCategories.length) return null;
    for (const category of productCategories) {
      if (category.subcategories) {
        const subcategory = category.subcategories.find(
          (sub) => sub.id === subcategoryId
        );
        if (subcategory) {
          return subcategory.name || subcategory.label;
        }
      }
    }
    return null;
  };

  // Get current list name
  const getCurrentListName = () => {
    // Show loading text when lists are loading
    if (listsLoading) {
      return t("shopping.loading");
    }

    // If no lists exist, return empty
    if (lists.length === 0 && (inviteSystem?.sharedLists?.length || 0) === 0) {
      return "";
    }

    // First check if it's in regular lists
    const currentList = lists.find((list) => list.id === currentListId);
    if (currentList) {
      return currentList.name;
    }

    // If not found in regular lists, check shared lists
    const sharedList = inviteSystem?.sharedLists?.find(
      (list) => list.id === currentListId
    );
    if (sharedList) {
      return sharedList.name;
    }

    // If currentListId exists but no matching list found, show loading
    if (currentListId) {
      return t("shopping.loading");
    }

    return "";
  };

  // Search function
  const handleSearch = (text) => {
    setNewItem(text);
    if (text.length > 0) {
      const filtered = products.filter((product) => {
        const productName = getTranslatedText(product, "name", i18n.language);
        return (
          productName && productName.toLowerCase().includes(text.toLowerCase())
        );
      });
      setSearchResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Add new list
  const addNewList = async () => {
    if (!user || !editListName.trim()) return;

    try {
      const listsRef = ref(database, `users/${user.uid}/shoppingLists`);
      const newListRef = push(listsRef);
      const newListId = newListRef.key;

      await set(newListRef, {
        name: editListName.trim(),
        createdAt: Date.now(),
      });

      setEditListName("");
      setCurrentListIdWithSave(newListId);

      setTimeout(() => {
        setShowEditListModal(false);
        setIsCreatingList(false);
      }, 100);
    } catch (error) {
      console.error("Error adding list:", error);
      Alert.alert("Fejl", "Kunne ikke oprette ny liste");
    }
  };

  // Handle create new list (opens the combined modal)
  const handleCreateNewList = () => {
    setEditListName("");
    setIsCreatingList(true);
    setShowEditListModal(true);
  };

  const deleteList = (listId, onConfirm) => {
    if (!user) return;

    if (onConfirm) {
      // Hvis onConfirm callback er givet, kald den i stedet for Alert
      onConfirm();
    } else {
      // Fallback til Alert hvis ingen callback er givet
      Alert.alert(t("shopping.deleteList"), t("shopping.deleteListConfirm"), [
        { text: t("shopping.cancel"), style: "cancel" },
        {
          text: t("shopping.delete"),
          style: "destructive",
          onPress: async () => {
            await performDeleteList(listId);
          },
        },
      ]);
    }
  };

  const performDeleteList = async (listId) => {
    try {
      setListsLoading(true);

      const listRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${listId}`
      );
      await remove(listRef);

      const itemsRef = ref(
        database,
        `users/${user.uid}/shoppingItems/${listId}`
      );
      await remove(itemsRef);

      // If this was the current list, select another list if available
      if (currentListId === listId) {
        // Check if there are other lists available
        const remainingLists = lists.filter((l) => l.id !== listId);
        const hasOtherLists =
          remainingLists.length > 0 ||
          (inviteSystem?.sharedLists?.length || 0) > 0;

        if (hasOtherLists) {
          // Select first available list
          if (remainingLists.length > 0) {
            setCurrentListIdWithSave(remainingLists[0].id);
          } else if (inviteSystem?.sharedLists?.length > 0) {
            setCurrentListIdWithSave(inviteSystem.sharedLists[0].id);
          }
        } else {
          // No lists left, clear selection
          setCurrentListIdWithSave(null);
        }
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      Alert.alert("Fejl", "Kunne ikke slette listen");
    } finally {
      setListsLoading(false);
    }
  };

  // Save list name
  const saveListName = async () => {
    if (!user || !editListName.trim()) return;

    try {
      if (!currentListId) {
        // Create a new list if no list is selected
        const listsRef = ref(database, `users/${user.uid}/shoppingLists`);
        const newListRef = push(listsRef);
        const newListId = newListRef.key;

        await set(newListRef, {
          name: editListName.trim(),
          createdAt: Date.now(),
        });

        setCurrentListIdWithSave(newListId);
      } else {
        // Edit existing list
        // First check if it's a properly formatted shared list
        if (
          currentListId.includes("_") &&
          currentListId.split("_").length === 2
        ) {
          const [ownerId, listId] = currentListId.split("_");
          // Additional check: ownerId should look like a Firebase UID
          if (ownerId.length >= 20 && /^[a-zA-Z0-9]+$/.test(ownerId)) {
            // This is a shared list
            // Only the owner can edit the list name
            if (ownerId === user.uid) {
              // Update the owner's list
              const listRef = ref(
                database,
                `users/${user.uid}/shoppingLists/${listId}`
              );
              await update(listRef, {
                name: editListName.trim(),
              });
            }
            return; // Exit early for shared lists
          }
        }

        // This is a regular list (user's own list)
        const listRef = ref(
          database,
          `users/${user.uid}/shoppingLists/${currentListId}`
        );
        await update(listRef, {
          name: editListName.trim(),
        });
      }
      setEditListName("");
      setShowEditListModal(false);
      closeBottomSheet();
    } catch (error) {
      console.error("Error editing list name:", error);
      Alert.alert(t("shopping.error"), t("shopping.errorEditingListName"));
    }
  };

  // Bottom sheet functions
  const openBottomSheet = () => {
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
  };

  // Load lists
  const loadLists = () => {
    if (!user) return;

    try {
      const listsRef = ref(database, `users/${user.uid}/shoppingLists`);
      const listsUnsubscribe = onValue(listsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listsArray = Object.entries(data).map(([id, list]) => ({
            id,
            ...list,
          }));
          setLists(listsArray);
        } else {
          setLists([]);
          setCurrentListIdWithSave(null);
        }
        setListsLoading(false);
      });

      return listsUnsubscribe;
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  // Load products
  const loadProducts = () => {
    try {
      // Load standard products
      const standardProductsRef = ref(database, "standard_products2");
      const userProductsRef = user
        ? ref(database, `users/${user.uid}/products`)
        : null;

      const unsubscribeStandard = onValue(
        standardProductsRef,
        (snapshot) => {
          const data = snapshot.val();
          let standardProducts = [];
          if (data) {
            standardProducts = Object.entries(data).map(([id, item]) => ({
              id: `standard_${id}`,
              name: item.name, // Keep original structure {da: "...", en: "..."}
              category_id: item.category_id,
              subcategory_id: item.subcategory_id,
              icon_url: item.icon_url || null,
            }));
          }

          // Combine with user products if available
          if (userProductsRef) {
            const unsubscribeUser = onValue(
              userProductsRef,
              (userSnapshot) => {
                const userData = userSnapshot.val();
                let userProducts = [];
                if (userData) {
                  userProducts = Object.entries(userData).map(([id, item]) => ({
                    id: `user_${id}`,
                    name: item.name, // Keep original structure {da: "...", en: "..."}
                    category_id: item.category_id,
                    subcategory_id: item.subcategory_id,
                    icon_url: item.icon_url || null,
                  }));
                }

                // Combine all products
                const allProducts = [...standardProducts, ...userProducts];
                setProducts(allProducts);
              },
              (error) => {
                console.error(
                  "Firebase listener error for user products:",
                  error
                );
                setProducts(standardProducts);
              }
            );

            return () => {
              unsubscribeUser();
            };
          } else {
            setProducts(standardProducts);
          }
        },
        (error) => {
          console.error(
            "Firebase listener error for standard products:",
            error
          );
        }
      );

      return () => {
        unsubscribeStandard();
      };
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  };

  // Load user settings
  const loadUserSettings = () => {
    if (user) {
      const colorRef = ref(database, `users/${user.uid}/settings/listColor`);
      const unsubscribeColor = onValue(colorRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserListColor(snapshot.val());
        } else {
          setUserListColor("#333");
        }
      });
      const fontRef = ref(database, `users/${user.uid}/settings/listFont`);
      const unsubscribeFont = onValue(fontRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserListFont(snapshot.val());
        } else {
          setUserListFont("Baloo2-Medium");
        }
      });
      return () => {
        unsubscribeColor();
        unsubscribeFont();
      };
    }
  };

  // Initialize other hooks first
  const inviteSystem = useInviteSystem(
    currentListId,
    getCurrentListName,
    lists,
    setCurrentListIdWithSave
  );

  const listMembers = useListMembers(
    currentListId,
    inviteSystem?.sharedLists || []
  );
  const listItems = useListItems(
    currentListId,
    products,
    userListColor,
    userListFont,
    productCategories
  );

  // Select product from search results
  const selectProduct = async (product) => {
    if (!user || !currentListId) return;

    try {
      const itemsPath = getItemsPath(user, currentListId);
      if (!itemsPath) return; // No valid path

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);

      const productName = getTranslatedText(product, "name", i18n.language);

      // Use product category_id and subcategory_id, or check memory for suggested category
      let finalCategoryId = product.category_id;
      try {
        const suggestedCategory = await getSuggestedCategory(
          user.uid,
          productName
        );
        // suggestedCategory is now category_id (or legacy category name)
        if (suggestedCategory) {
          // Check if it's a category_id (starts with "cat-") or legacy category name
          if (suggestedCategory.startsWith("cat-")) {
            finalCategoryId = suggestedCategory;
          } else {
            // Legacy category name - try to convert to category_id
            const category = productCategories.find(
              (cat) =>
                cat.label === suggestedCategory ||
                cat.name === suggestedCategory
            );
            if (category) {
              finalCategoryId = category.id;
            }
          }
        }
      } catch (error) {
        console.error("Error getting suggested category:", error);
      }

      const itemData = {
        name: productName,
        product_id: product.id,
        category_id: finalCategoryId,
        subcategory_id: product.subcategory_id || null,
        quantity: "",
        unit: "",
        completed: false,
        color: userListColor || "#333",
        font: userListFont || "Baloo2-Medium",
      };

      // Only add icon_url if it exists and is not null/undefined
      if (product.icon_url) {
        itemData.icon_url = product.icon_url;
      }

      // Save category memory if needed (using category_id)
      if (finalCategoryId && finalCategoryId !== product.category_id) {
        try {
          await updateCategoryMemory(user.uid, productName, finalCategoryId);
        } catch (memoryError) {
          console.error("Error saving category memory:", memoryError);
          // Don't fail the main operation if memory saving fails
        }
      }

      set(newItemRef, itemData)
        .then(() => {
          setNewItem("");
          setShowResults(false);
        })
        .catch((error) => {
          console.error("Error adding item:", error);
        });
    } catch (error) {
      console.error("Error in selectProduct:", error);
    }
  };
  const addItem = async () => {
    if (!user || !newItem.trim() || !currentListId) return;

    try {
      const matchingProduct = products.find((product) => {
        const productName = getTranslatedText(product, "name", i18n.language);
        return (
          productName &&
          productName.toLowerCase() === newItem.trim().toLowerCase()
        );
      });

      const itemsPath = getItemsPath(user, currentListId);
      if (!itemsPath) return; // No valid path

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);
      const finalItemName = matchingProduct
        ? getTranslatedText(matchingProduct, "name", i18n.language)
        : newItem.trim();

      // Get suggested category from memory (always check, even for standard products)
      let finalCategoryId = matchingProduct
        ? matchingProduct.category_id
        : null;
      try {
        const suggestedCategory = await getSuggestedCategory(
          user.uid,
          finalItemName
        );
        // suggestedCategory is now category_id (or legacy category name)
        if (suggestedCategory) {
          // Check if it's a category_id (starts with "cat-") or legacy category name
          if (suggestedCategory.startsWith("cat-")) {
            finalCategoryId = suggestedCategory;
          } else {
            // Legacy category name - try to convert to category_id
            const category = productCategories.find(
              (cat) =>
                cat.label === suggestedCategory ||
                cat.name === suggestedCategory
            );
            if (category) {
              finalCategoryId = category.id;
            }
          }
        }
      } catch (error) {
        console.error("Error getting suggested category:", error);
      }

      const itemData = {
        name: finalItemName,
        product_id: matchingProduct ? matchingProduct.id : null,
        category_id: finalCategoryId,
        subcategory_id: matchingProduct ? matchingProduct.subcategory_id : null,
        quantity: "",
        unit: "",
        completed: false,
        color: userListColor || "#333",
        font: userListFont || "Baloo2-Medium",
      };

      // Only add icon_url if it exists and is not null/undefined
      if (matchingProduct && matchingProduct.icon_url) {
        itemData.icon_url = matchingProduct.icon_url;
      }

      // Save category memory if needed (using category_id)
      if (
        finalCategoryId &&
        matchingProduct &&
        finalCategoryId !== matchingProduct.category_id
      ) {
        try {
          await updateCategoryMemory(user.uid, finalItemName, finalCategoryId);
        } catch (memoryError) {
          console.error("Error saving category memory:", memoryError);
          // Don't fail the main operation if memory saving fails
        }
      }

      set(newItemRef, itemData)
        .then(() => {
          setNewItem("");
          setShowResults(false);
        })
        .catch((error) => {
          console.error("Error adding item:", error);
        });
    } catch (error) {
      console.error("Error in addItem:", error);
    }
  };

  // Effects
  useEffect(() => {
    if (!user) return;

    // Load last selected list
    const loadLastList = async () => {
      const lastListId = await loadLastSelectedList();
      if (lastListId) {
        setCurrentListId(lastListId);
      }
    };
    loadLastList();

    // Load product categories
    loadProductCategories();

    const listsUnsubscribe = loadLists();
    const productsUnsubscribe = loadProducts();
    const settingsUnsubscribe = loadUserSettings();
    const sharedListsUnsubscribe = inviteSystem.loadSharedLists();

    return () => {
      if (listsUnsubscribe) listsUnsubscribe();
      if (productsUnsubscribe) productsUnsubscribe();
      if (settingsUnsubscribe) settingsUnsubscribe();
      if (sharedListsUnsubscribe) sharedListsUnsubscribe();
    };
  }, [user, i18n.language]);

  // Auto-select first available list if no list is currently selected
  useEffect(() => {
    if (
      !listsLoading &&
      !currentListId &&
      (lists.length > 0 || (inviteSystem?.sharedLists?.length || 0) > 0)
    ) {
      // First try to load the last selected list
      const loadLastList = async () => {
        setListsLoading(true);

        const lastListId = await loadLastSelectedList();
        if (lastListId) {
          // Check if the last selected list still exists
          const lastListExists =
            lists.some((list) => list.id === lastListId) ||
            inviteSystem?.sharedLists?.some((list) => list.id === lastListId) ||
            false;
          if (lastListExists) {
            setCurrentListIdWithSave(lastListId);
            return;
          }
        }

        // If no last list or it doesn't exist, select first available list
        if (lists.length > 0) {
          // First priority: user's own lists
          setCurrentListIdWithSave(lists[0].id);
        } else if (inviteSystem?.sharedLists?.length > 0) {
          // Second priority: shared lists
          setCurrentListIdWithSave(inviteSystem.sharedLists[0].id);
        }
      };

      loadLastList();
    }
  }, [listsLoading, currentListId, lists, inviteSystem?.sharedLists]);

  // Reset loading when user changes
  useEffect(() => {
    if (user) {
      setListsLoading(true);
    }
  }, [user]);

  // Set loading to false when a list is selected and exists
  useEffect(() => {
    if (currentListId && listsLoading) {
      const listExists =
        lists.some((list) => list.id === currentListId) ||
        inviteSystem?.sharedLists?.some((list) => list.id === currentListId) ||
        false;

      if (listExists) {
        setListsLoading(false);
      }
    }
  }, [currentListId, lists, inviteSystem?.sharedLists, listsLoading]);

  // Load list members when currentListId changes
  useEffect(() => {
    if (
      user &&
      currentListId &&
      (lists.length > 0 || (inviteSystem?.sharedLists?.length || 0) > 0)
    ) {
      listMembers.loadListMembers();
    }
  }, [user, currentListId, lists, inviteSystem?.sharedLists]);

  // Load list members when bottom sheet opens
  useEffect(() => {
    if (
      showBottomSheet &&
      user &&
      currentListId &&
      (lists.length > 0 || (inviteSystem?.sharedLists?.length || 0) > 0)
    ) {
      listMembers.loadListMembers();
    }
  }, [showBottomSheet, user, currentListId, lists, inviteSystem?.sharedLists]);

  // Load items when currentListId changes
  useEffect(() => {
    if (!user || !currentListId) return;

    try {
      const itemsPath = getItemsPath(user, currentListId);
      if (!itemsPath) return; // No valid path

      const itemsRef = ref(database, itemsPath);

      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const itemsArray = Object.entries(data).map(([id, item]) => ({
              id,
              ...item,
            }));
            listItems.setItems(itemsArray);
          } else {
            listItems.setItems([]);
          }
        },
        (error) => {
          console.error("Firebase listener error:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  }, [user, currentListId]);

  // Helper function to sort items by category using productCategories order
  const sortItemsWithCategoryId = (items) => {
    return [...items].sort((a, b) => {
      if (!a.category_id || !b.category_id) {
        // Items without category_id go to the end
        if (!a.category_id && !b.category_id) return 0;
        if (!a.category_id) return 1;
        if (!b.category_id) return -1;
      }

      // Find category index in productCategories (already sorted by categoryOrder)
      const indexA = productCategories.findIndex(
        (cat) => cat.id === a.category_id
      );
      const indexB = productCategories.findIndex(
        (cat) => cat.id === b.category_id
      );

      // If not found, put at the end
      const orderA = indexA !== -1 ? indexA : 999;
      const orderB = indexB !== -1 ? indexB : 999;

      return orderA - orderB;
    });
  };

  // Computed values
  const sortedItems = sortItemsWithCategoryId(listItems.items);
  const hasCompletedItems = isItemCompleted(listItems.items);
  const hasItems = hasItemsUtil(listItems.items);

  return {
    // Core state
    newItem,
    setNewItem,
    searchResults,
    setSearchResults,
    showResults,
    setShowResults,
    products,
    lists,
    currentListId,
    listsLoading,
    showListDropdown,
    setShowListDropdown,

    // UI state
    showBottomSheet,
    setShowBottomSheet,
    showEditListModal,
    setShowEditListModal,
    showDeleteListModal,
    setShowDeleteListModal,
    isCreatingList,
    setIsCreatingList,
    editListName,
    setEditListName,
    userListColor,
    setUserListColor,
    userListFont,
    setUserListFont,

    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Functions
    getAvailableCategories,
    getCategoryOptions,
    getCategoryNameById,
    getSubcategoryNameById,
    handleSearch,
    selectProduct,
    addItem,
    addNewList,
    handleCreateNewList,
    deleteList,
    performDeleteList,
    saveListName,
    openBottomSheet,
    closeBottomSheet,
    getCurrentListName,
    setCurrentListIdWithSave,

    // Spread other hooks
    ...inviteSystem,
    ...listMembers,
    ...listItems,
  };
}
