import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Share } from "react-native";
import { database } from "../firebase";
import {
  generateInviteLink as generateInviteLinkUtil,
  getItemPath,
  getItemsPath,
  hasItems as hasItemsUtil,
  isItemCompleted,
  sortItemsByCategory,
} from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useShoppingList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  // State
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [lists, setLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [listsLoading, setListsLoading] = useState(true);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListName, setEditListName] = useState("");
  const [listMembers, setListMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [userListColor, setUserListColor] = useState("#333");
  const [userListFont, setUserListFont] = useState("Baloo2-Bold");

  // Custom setCurrentListId that saves to AsyncStorage
  const setCurrentListIdWithSave = (listId) => {
    console.log("setCurrentListIdWithSave called with:", listId);
    console.log("Current user:", user?.uid);
    setCurrentListId(listId);
    saveLastSelectedList(listId);
    console.log("setCurrentListIdWithSave completed");
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

  // Computed values using utility functions
  const sortedItems = sortItemsByCategory(items);
  const hasCompletedItems = isItemCompleted(items);
  const hasItems = hasItemsUtil(items);

  // Get current list name
  const getCurrentListName = () => {
    // Show loading text when lists are loading
    if (listsLoading) {
      return t("shopping.loading");
    }

    // If no lists exist, return empty
    if (lists.length === 0 && sharedLists.length === 0) {
      return "";
    }

    // First check if it's in regular lists
    const currentList = lists.find((list) => list.id === currentListId);
    if (currentList) {
      return currentList.name;
    }

    // If not found in regular lists, check shared lists
    const sharedList = sharedLists.find((list) => list.id === currentListId);
    if (sharedList) {
      return sharedList.name;
    }

    // If currentListId exists but no matching list found, show loading
    // This prevents showing "Liste" during transitions
    if (currentListId) {
      return t("shopping.loading");
    }

    return "";
  };

  // Generate invite link using utility function
  const generateInviteLink = () => {
    return generateInviteLinkUtil(user, currentListId, getCurrentListName);
  };

  // Share list
  const shareList = async () => {
    try {
      const inviteLink = generateInviteLink();
      await Share.share({
        message: `Hej! Du er inviteret til at deltage i min indkøbsliste "${getCurrentListName()}". Klik på linket for at tilslutte dig: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing list:", error);
    }
  };

  // Search function
  const handleSearch = (text) => {
    setNewItem(text);
    if (text.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Select product from search results
  const selectProduct = (product) => {
    if (!user || !currentListId) return;

    try {
      const itemsPath = getItemsPath(user, currentListId);
      if (!itemsPath) return; // No valid path

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);
      set(newItemRef, {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        completed: false,
        icon_url: product.icon_url,
        color: userListColor || "#333",
        font: userListFont || "Baloo2-Bold",
      })
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

  // Add item
  const addItem = () => {
    if (!user || !newItem.trim() || !currentListId) return;

    try {
      const matchingProduct = products.find(
        (product) => product.name.toLowerCase() === newItem.trim().toLowerCase()
      );

      const itemsPath = getItemsPath(user, currentListId);
      if (!itemsPath) return; // No valid path

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);
      set(newItemRef, {
        name: matchingProduct ? matchingProduct.name : newItem,
        category: matchingProduct ? matchingProduct.category : "",
        subcategory: matchingProduct ? matchingProduct.subcategory : "",
        completed: false,
        icon_url: matchingProduct ? matchingProduct.icon_url : "",
        color: userListColor || "#333",
        font: userListFont || "Baloo2-Bold",
      })
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

  // Add new list
  const addNewList = async () => {
    if (!user || !newListName.trim()) return;

    try {
      const listsRef = ref(database, `users/${user.uid}/shoppingLists`);
      const newListRef = push(listsRef);
      const newListId = newListRef.key;

      await set(newListRef, {
        name: newListName.trim(),
        createdAt: Date.now(),
      });

      setNewListName("");
      setCurrentListIdWithSave(newListId);

      setTimeout(() => {
        setShowAddListModal(false);
      }, 100);
    } catch (error) {
      console.error("Error adding list:", error);
      Alert.alert("Fejl", "Kunne ikke oprette ny liste");
    }
  };

  // Delete list
  const deleteList = (listId) => {
    if (!user) return;

    Alert.alert(t("shopping.deleteList"), t("shopping.deleteListConfirm"), [
      { text: t("shopping.cancel"), style: "cancel" },
      {
        text: t("shopping.delete"),
        style: "destructive",
        onPress: async () => {
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
                remainingLists.length > 0 || sharedLists.length > 0;

              if (hasOtherLists) {
                // Select first available list
                if (remainingLists.length > 0) {
                  setCurrentListIdWithSave(remainingLists[0].id);
                } else if (sharedLists.length > 0) {
                  setCurrentListIdWithSave(sharedLists[0].id);
                }
              } else {
                // No lists left, clear selection
                setCurrentListIdWithSave(null);
              }
            }
          } catch (error) {
            console.error("Error deleting list:", error);
            Alert.alert("Fejl", "Kunne ikke slette listen");
            setListsLoading(false);
          }
        },
      },
    ]);
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

  // Select shared list
  const selectSharedList = (sharedList) => {
    setCurrentListIdWithSave(sharedList.id);
    setShowListDropdown(false);
  };

  // Leave shared list
  const leaveSharedList = (sharedList) => {
    const action = sharedList.isOwner ? "slette" : "forlade";
    const title = sharedList.isOwner
      ? t("shopping.deleteList")
      : t("shopping.leaveList");

    Alert.alert(
      title,
      `Er du sikker på, at du vil ${action} "${sharedList.name}"?`,
      [
        { text: t("shopping.cancel"), style: "cancel" },
        {
          text: sharedList.isOwner ? t("shopping.delete") : t("shopping.leave"),
          style: "destructive",
          onPress: async () => {
            try {
              setListsLoading(true);

              if (sharedList.isOwner) {
                const listRef = ref(
                  database,
                  `users/${user.uid}/shoppingLists/${sharedList.originalId}`
                );
                await remove(listRef);
              } else {
                const memberRef = ref(
                  database,
                  `users/${sharedList.ownerId}/shoppingLists/${sharedList.originalId}/members/${user.uid}`
                );
                await remove(memberRef);
              }

              const sharedListRef = ref(
                database,
                `shared_lists/${user.uid}/${sharedList.id}`
              );
              await remove(sharedListRef);

              if (currentListId === sharedList.id) {
                // Check if there are other lists available
                const remainingLists = lists.filter(
                  (l) => l.id !== sharedList.originalId
                );
                const remainingSharedLists = sharedLists.filter(
                  (l) => l.id !== sharedList.id
                );
                const hasOtherLists =
                  remainingLists.length > 0 || remainingSharedLists.length > 0;

                if (hasOtherLists) {
                  // Select first available list
                  if (remainingLists.length > 0) {
                    setCurrentListIdWithSave(remainingLists[0].id);
                  } else if (remainingSharedLists.length > 0) {
                    setCurrentListIdWithSave(remainingSharedLists[0].id);
                  }
                } else {
                  // No lists left, clear selection
                  setCurrentListIdWithSave(null);
                }
              }
            } catch (error) {
              console.error("Error leaving/deleting shared list:", error);
              Alert.alert("Fejl", `Kunne ikke ${action} listen`);
              setListsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Remove user from list
  const removeUserFromList = (userId) => {
    if (!user || !currentListId) return;

    Alert.alert(t("shopping.removeUser"), t("shopping.removeUserConfirm"), [
      { text: t("shopping.cancel"), style: "cancel" },
      {
        text: t("shopping.remove"),
        style: "destructive",
        onPress: async () => {
          try {
            const memberRef = ref(
              database,
              `users/${user.uid}/shoppingLists/${currentListId}/members/${userId}`
            );
            await remove(memberRef);
          } catch (error) {
            console.error("Error removing user:", error);
            Alert.alert("Fejl", "Kunne ikke fjerne bruger");
          }
        },
      },
    ]);
  };

  // Handle manual invite code
  const handleManualInviteCode = async () => {
    if (!inviteCodeInput.trim()) return;

    try {
      const parts = inviteCodeInput.trim().split("_");
      if (parts.length < 3) {
        Alert.alert(t("shopping.error"), t("shopping.invalidInviteCode"));
        return;
      }

      const [ownerName, listName, timestamp] = parts;

      const cleanOwnerName = ownerName
        .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const cleanListName = listName
        .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const listRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}`
      );
      const listSnapshot = await get(listRef);

      if (!listSnapshot.exists()) {
        Alert.alert(t("shopping.error"), t("shopping.listNotFound"));
        return;
      }

      const listData = listSnapshot.val();

      const membersRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}/members`
      );
      const membersSnapshot = await get(membersRef);

      if (membersSnapshot.exists() && membersSnapshot.val()[user.uid]) {
        Alert.alert(t("shopping.info"), t("shopping.alreadyMember"));
        setShowInviteCodeModal(false);
        setInviteCodeInput("");
        return;
      }

      const userMemberRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}/members/${user.uid}`
      );

      await set(userMemberRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        joinedAt: Date.now(),
      });

      const sharedListRef = ref(
        database,
        `shared_lists/${user.uid}/${cleanOwnerName}-${cleanListName}-${timestamp}`
      );
      await set(sharedListRef, {
        originalId: `${cleanOwnerName}-${cleanListName}-${timestamp}`,
        ownerId: user.uid,
        ownerName:
          user.displayName || user.email?.split("@")[0] || "Ukendt bruger",
        name: listData.name,
        createdAt: listData.createdAt,
        isShared: true,
        isOwner: false,
      });

      Alert.alert(t("shopping.success"), t("shopping.joinedList"));
      setShowInviteCodeModal(false);
      setInviteCodeInput("");

      setCurrentListIdWithSave(
        `${cleanOwnerName}-${cleanListName}-${timestamp}`
      );
    } catch (error) {
      console.error("Error handling invite code:", error);

      let errorMessage = t("shopping.errorJoiningList");

      if (error.message.includes("Permission denied")) {
        errorMessage = t("shopping.errorJoiningListPermissionDenied");
      } else if (error.message.includes("not found")) {
        errorMessage = t("shopping.errorJoiningListNotFound");
      }

      Alert.alert(t("shopping.error"), errorMessage);
    }
  };

  // Bottom sheet functions
  const openBottomSheet = () => {
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
  };

  // Load list members
  const loadListMembers = () => {
    if (!user || !currentListId) return;

    try {
      // Determine the correct path for members
      const sharedList = sharedLists.find((list) => list.id === currentListId);
      const isSharedList = !!sharedList;

      const ownerId = isSharedList ? sharedList.ownerId : user.uid;
      const listId = isSharedList ? sharedList.originalId : currentListId;

      const membersRef = ref(
        database,
        `users/${ownerId}/shoppingLists/${listId}/members`
      );

      const unsubscribe = onValue(membersRef, async (snapshot) => {
        const data = snapshot.val();
        let membersArray = [];

        if (data) {
          // Fetch user data for all members
          const membersWithData = await Promise.all(
            Object.entries(data).map(async ([id, member]) => {
              try {
                // Get user data from database
                const [displayNameSnapshot, photoURLSnapshot] =
                  await Promise.all([
                    get(ref(database, `users/${id}/displayName`)),
                    get(ref(database, `users/${id}/photoURL`)),
                  ]);

                return {
                  id,
                  ...member,
                  displayName: displayNameSnapshot.exists()
                    ? displayNameSnapshot.val()
                    : member.displayName || member.email || "Ukendt bruger",
                  photoURL: photoURLSnapshot.exists()
                    ? photoURLSnapshot.val()
                    : member.photoURL || null,
                };
              } catch (error) {
                console.error(`Error fetching user data for ${id}:`, error);
                return {
                  id,
                  ...member,
                  displayName:
                    member.displayName || member.email || "Ukendt bruger",
                  photoURL: member.photoURL || null,
                };
              }
            })
          );
          membersArray = membersWithData;
        }

        // Add owner if not already present
        const ownerExists = membersArray.some(
          (member) => member.id === ownerId
        );
        if (!ownerExists) {
          try {
            // Get owner data from database using same logic as other members
            const [ownerDisplayNameSnapshot, ownerPhotoURLSnapshot] =
              await Promise.all([
                get(ref(database, `users/${ownerId}/displayName`)),
                get(ref(database, `users/${ownerId}/photoURL`)),
              ]);

            const ownerMember = {
              id: ownerId,
              displayName: ownerDisplayNameSnapshot.exists()
                ? ownerDisplayNameSnapshot.val()
                : isSharedList
                ? sharedList.ownerName || ownerId || "Ukendt bruger"
                : user.displayName ||
                  user.email?.split("@")[0] ||
                  ownerId ||
                  "Ukendt bruger",
              email: isSharedList ? "" : user.email || "",
              photoURL: ownerPhotoURLSnapshot.exists()
                ? ownerPhotoURLSnapshot.val()
                : isSharedList
                ? null
                : user.photoURL || null,
              isOwner: true,
              joinedAt: isSharedList
                ? sharedList.createdAt || Date.now()
                : Date.now(),
            };
            membersArray.unshift(ownerMember);
          } catch (error) {
            console.error(`Error fetching owner data for ${ownerId}:`, error);
            // Fallback to original logic if database fetch fails
            const ownerMember = {
              id: ownerId,
              displayName: isSharedList
                ? sharedList.ownerName || ownerId || "Ukendt bruger"
                : user.displayName ||
                  user.email?.split("@")[0] ||
                  ownerId ||
                  "Ukendt bruger",
              email: isSharedList ? "" : user.email || "",
              photoURL: isSharedList ? null : user.photoURL || null,
              isOwner: true,
              joinedAt: isSharedList
                ? sharedList.createdAt || Date.now()
                : Date.now(),
            };
            membersArray.unshift(ownerMember);
          }
        }

        setListMembers(membersArray);
        console.log("membersArray", membersArray);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading list members:", error);
    }
  };

  // Load shared lists
  const loadSharedLists = () => {
    if (!user) return;

    try {
      const sharedListsRef = ref(database, `shared_lists/${user.uid}`);

      const unsubscribe = onValue(sharedListsRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const sharedListsArray = Object.entries(data).map(
            ([listId, listData]) => ({
              id: listId,
              originalId: listData.originalId,
              ownerId: listData.ownerId,
              ownerName: listData.ownerName,
              name: listData.name,
              createdAt: listData.createdAt,
              isShared: true,
              isOwner: listData.isOwner,
            })
          );

          setSharedLists(sharedListsArray);
        } else {
          setSharedLists([]);
        }
        // Loading is set to false in the main lists useEffect
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error in loadSharedLists:", error);
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
        // No lists exist - this is now allowed
        setLists([]);
        setCurrentListIdWithSave(null);
      }
      setListsLoading(false);
    });

    const sharedListsUnsubscribe = loadSharedLists();

    return () => {
      listsUnsubscribe();
      if (sharedListsUnsubscribe) {
        sharedListsUnsubscribe();
      }
    };
  }, [user]);

  // Auto-select first available list if no list is currently selected
  useEffect(() => {
    if (
      !listsLoading &&
      !currentListId &&
      (lists.length > 0 || sharedLists.length > 0)
    ) {
      // First try to load the last selected list
      const loadLastList = async () => {
        setListsLoading(true);

        const lastListId = await loadLastSelectedList();
        if (lastListId) {
          // Check if the last selected list still exists
          const lastListExists =
            lists.some((list) => list.id === lastListId) ||
            sharedLists.some((list) => list.id === lastListId);
          if (lastListExists) {
            setCurrentListIdWithSave(lastListId);
            // Don't set loading to false here - let the main useEffect handle it
            return;
          }
        }

        // If no last list or it doesn't exist, select first available list
        if (lists.length > 0) {
          // First priority: user's own lists
          setCurrentListIdWithSave(lists[0].id);
        } else if (sharedLists.length > 0) {
          // Second priority: shared lists
          setCurrentListIdWithSave(sharedLists[0].id);
        }

        // Don't set loading to false here - let the main useEffect handle it
      };

      loadLastList();
    }
  }, [listsLoading, currentListId, lists, sharedLists]);

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
        sharedLists.some((list) => list.id === currentListId);

      if (listExists) {
        setListsLoading(false);
      }
    }
  }, [currentListId, lists, sharedLists, listsLoading]);

  useEffect(() => {
    if (user && currentListId && (lists.length > 0 || sharedLists.length > 0)) {
      loadListMembers();
    }
  }, [user, currentListId, lists, sharedLists]);

  useEffect(() => {
    if (
      showBottomSheet &&
      user &&
      currentListId &&
      (lists.length > 0 || sharedLists.length > 0)
    ) {
      loadListMembers();
    }
  }, [showBottomSheet, user, currentListId, lists, sharedLists]);

  useEffect(() => {
    if (showAddListModal) {
      setNewListName("");
    }
  }, [showAddListModal]);

  useEffect(() => {
    try {
      // Load standard products
      const standardProductsRef = ref(database, "standard_products");
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
              ...item,
              isStandard: true,
              createdBy: "system",
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
                    ...item,
                    isStandard: false,
                    createdBy: user.uid,
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
  }, [user]);

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
            setItems(itemsArray);
          } else {
            setItems([]);
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

  useEffect(() => {
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
          setUserListFont("Baloo2-Bold");
        }
      });
      return () => {
        unsubscribeColor();
        unsubscribeFont();
      };
    }
  }, [user]);

  return {
    // State
    items,
    newItem,
    searchResults,
    showResults,
    products,
    lists,
    sharedLists,
    currentListId,
    showListDropdown,
    showAddListModal,
    newListName,
    showBottomSheet,
    showEditListModal,
    editListName,
    listMembers,
    showMembersModal,
    showInviteCodeModal,
    inviteCodeInput,
    userListColor,
    userListFont,
    listsLoading,

    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Functions
    setNewItem,
    setShowResults,
    setShowListDropdown,
    setShowAddListModal,
    setNewListName,
    setShowBottomSheet,
    setShowEditListModal,
    setEditListName,
    setShowMembersModal,
    setShowInviteCodeModal,
    setInviteCodeInput,
    setUserListColor,
    setUserListFont,
    setListsLoading,

    handleSearch,
    selectProduct,
    addItem,
    toggleItem,
    deleteCompletedItems,
    deleteAllItems,
    addNewList,
    deleteList,
    saveListName,
    selectSharedList,
    leaveSharedList,
    removeUserFromList,
    handleManualInviteCode,

    shareList,

    openBottomSheet,
    closeBottomSheet,

    getCurrentListName,
    generateInviteLink,
    setCurrentListIdWithSave: (() => {
      console.log("Returning setCurrentListIdWithSave function");
      return setCurrentListIdWithSave;
    })(),
  };
}
