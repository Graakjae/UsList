import * as MediaLibrary from "expo-media-library";
import {
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Share } from "react-native";
import { runOnJS, useSharedValue, withSpring } from "react-native-reanimated";
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

  // State
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [lists, setLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [currentListId, setCurrentListId] = useState("default");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListName, setEditListName] = useState("");
  const [listMembers, setListMembers] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [userListColor, setUserListColor] = useState("#333");
  const [userListFont, setUserListFont] = useState("Baloo2-Bold");

  // Refs and animations
  const qrCodeRef = useRef();
  const qrModalOpacity = useSharedValue(0);

  // Computed values using utility functions
  const sortedItems = sortItemsByCategory(items);
  const hasCompletedItems = isItemCompleted(items);
  const hasItems = hasItemsUtil(items);

  // Get current list name
  const getCurrentListName = () => {
    if (currentListId === "default") return "Indkøbsliste";

    if (currentListId.includes("_")) {
      const sharedList = sharedLists.find((list) => list.id === currentListId);
      return sharedList ? `${sharedList.name} ` : "Liste";
    }

    const currentList = lists.find((list) => list.id === currentListId);
    return currentList ? currentList.name : "Indkøbsliste";
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
        url: inviteLink,
      });
    } catch (error) {
      console.error("Error sharing list:", error);
    }
  };

  // Send email invitation
  const sendEmailInvitation = () => {
    const inviteLink = generateInviteLink();
    const subject = `Invitation til indkøbsliste: ${getCurrentListName()}`;
    const body = `Hej!\n\nDu er inviteret til at deltage i min indkøbsliste "${getCurrentListName()}".\n\nKlik på dette link for at tilslutte dig: ${inviteLink}\n\nMed venlig hilsen`;

    Linking.openURL(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  // Show QR code
  const showQRCode = () => {
    const inviteLink = generateInviteLink();
    setQrCodeData(inviteLink);
    setShowQRModal(true);
    qrModalOpacity.value = withSpring(1, { damping: 15 });
    closeBottomSheet();
  };

  // Close QR modal
  const closeQRModal = () => {
    qrModalOpacity.value = withSpring(0, { damping: 15 }, () => {
      runOnJS(setShowQRModal)(false);
    });
  };

  // Save QR code to gallery
  const saveQRCodeToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Tilladelse nødvendig",
          "Du skal give tilladelse til at gemme billeder i galleriet."
        );
        return;
      }

      const uri = await qrCodeRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Succes", "QR-kode er gemt i dit galleri!");
    } catch (error) {
      console.error("Error saving QR code:", error);
      Alert.alert("Fejl", "Kunne ikke gemme QR-kode");
    }
  };

  // Share QR code
  const shareQRCode = async () => {
    try {
      const uri = await qrCodeRef.current.capture();
      await Share.share({
        url: uri,
        message: `QR-kode til indkøbsliste "${getCurrentListName()}"`,
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Fejl", "Kunne ikke dele QR-kode");
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
    if (!user) return;

    try {
      const itemsPath = getItemsPath(user, currentListId);
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
    if (!user || !newItem.trim()) return;

    try {
      const matchingProduct = products.find(
        (product) => product.name.toLowerCase() === newItem.trim().toLowerCase()
      );

      const itemsPath = getItemsPath(user, currentListId);
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
    if (!user) return;

    const itemPath = getItemPath(user, currentListId, id);
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
    if (!user) return;

    Alert.alert(
      "Slet overstregede varer",
      "Er du sikker på, at du vil slette alle overstregede varer?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const completedItems = items.filter((item) => item.completed);
            completedItems.forEach((item) => {
              const itemPath = getItemPath(user, currentListId, item.id);
              const itemRef = ref(database, itemPath);
              remove(itemRef);
            });
          },
        },
      ]
    );
  };

  // Delete all items
  const deleteAllItems = () => {
    if (!user) return;

    Alert.alert(
      "Slet alle varer",
      "Er du sikker på, at du vil slette alle varer?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const itemsPath = getItemsPath(user, currentListId);
            const itemsRef = ref(database, itemsPath);
            remove(itemsRef);
          },
        },
      ]
    );
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
      setCurrentListId(newListId);

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

    Alert.alert(
      "Slet liste",
      "Er du sikker på, at du vil slette denne liste? Alle varer i listen vil også blive slettet.",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
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

              const remainingLists = lists.filter((list) => list.id !== listId);
              if (remainingLists.length === 0) {
                const defaultListRef = ref(
                  database,
                  `users/${user.uid}/shoppingLists/default`
                );
                await set(defaultListRef, {
                  name: "Indkøbsliste",
                  createdAt: Date.now(),
                });
                setCurrentListId("default");
              } else {
                setCurrentListId(remainingLists[0].id);
              }
            } catch (error) {
              console.error("Error deleting list:", error);
              Alert.alert("Fejl", "Kunne ikke slette listen");
            }
          },
        },
      ]
    );
  };

  // Save list name
  const saveListName = async () => {
    if (!user || currentListId === "default" || !editListName.trim()) return;

    try {
      const listRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${currentListId}`
      );
      await update(listRef, {
        name: editListName.trim(),
      });

      setEditListName("");
      setShowEditListModal(false);
      closeBottomSheet();
    } catch (error) {
      console.error("Error editing list name:", error);
      Alert.alert("Fejl", "Kunne ikke redigere liste navn");
    }
  };

  // Select shared list
  const selectSharedList = (sharedList) => {
    setCurrentListId(sharedList.id);
    setShowListDropdown(false);
  };

  // Leave shared list
  const leaveSharedList = (sharedList) => {
    const action = sharedList.isOwner ? "slette" : "forlade";
    const title = sharedList.isOwner ? "Slet liste" : "Forlad liste";

    Alert.alert(
      title,
      `Er du sikker på, at du vil ${action} "${sharedList.name}"?`,
      [
        { text: "Annuller", style: "cancel" },
        {
          text: sharedList.isOwner ? "Slet" : "Forlad",
          style: "destructive",
          onPress: async () => {
            try {
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
                setCurrentListId("default");
              }
            } catch (error) {
              console.error("Error leaving/deleting shared list:", error);
              Alert.alert("Fejl", `Kunne ikke ${action} listen`);
            }
          },
        },
      ]
    );
  };

  // Remove user from list
  const removeUserFromList = (userId) => {
    if (!user || currentListId === "default") return;

    Alert.alert(
      "Fjern bruger",
      "Er du sikker på, at du vil fjerne denne bruger fra listen?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Fjern",
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
      ]
    );
  };

  // Handle manual invite code
  const handleManualInviteCode = async () => {
    if (!inviteCodeInput.trim()) return;

    try {
      const parts = inviteCodeInput.trim().split("_");
      if (parts.length < 3) {
        Alert.alert("Fejl", "Ugyldig invitation kode");
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
        Alert.alert("Fejl", "Listen findes ikke længere");
        return;
      }

      const listData = listSnapshot.val();

      const membersRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}/members`
      );
      const membersSnapshot = await get(membersRef);

      if (membersSnapshot.exists() && membersSnapshot.val()[user.uid]) {
        Alert.alert("Info", "Du er allerede medlem af denne liste");
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

      Alert.alert("Succes", "Du er nu tilsluttet listen!");
      setShowInviteCodeModal(false);
      setInviteCodeInput("");

      setCurrentListId(`${cleanOwnerName}-${cleanListName}-${timestamp}`);
    } catch (error) {
      console.error("Error handling invite code:", error);

      let errorMessage = "Kunne ikke tilslutte dig listen. Prøv igen senere.";

      if (error.message.includes("Permission denied")) {
        errorMessage =
          "Du har ikke tilladelse til at tilslutte dig denne liste. Kontakt listen's ejer.";
      } else if (error.message.includes("not found")) {
        errorMessage = "Listen findes ikke længere.";
      }

      Alert.alert("Fejl", errorMessage);
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
    if (!user || currentListId === "default") return;

    try {
      const membersRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${currentListId}/members`
      );
      const unsubscribe = onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const membersArray = Object.entries(data).map(([id, member]) => ({
            id,
            ...member,
          }));
          setListMembers(membersArray);
        } else {
          setListMembers([]);
        }
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
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error in loadSharedLists:", error);
    }
  };

  // Effects
  useEffect(() => {
    if (!user) return;

    const listsRef = ref(database, `users/${user.uid}/shoppingLists`);
    const listsUnsubscribe = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listsArray = Object.entries(data).map(([id, list]) => ({
          id,
          ...list,
        }));
        setLists(listsArray);

        if (currentListId === "default" && listsArray.length > 0) {
          setCurrentListId(listsArray[0].id);
        }
      } else {
        const defaultListRef = ref(
          database,
          `users/${user.uid}/shoppingLists/default`
        );
        set(defaultListRef, {
          name: "Indkøbsliste",
          createdAt: Date.now(),
        });
        setLists([]);
      }
    });

    const sharedListsUnsubscribe = loadSharedLists();

    return () => {
      listsUnsubscribe();
      if (sharedListsUnsubscribe) {
        sharedListsUnsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    if (showBottomSheet && user && currentListId !== "default") {
      loadListMembers();
    }
  }, [showBottomSheet, user, currentListId]);

  useEffect(() => {
    if (showAddListModal) {
      setNewListName("");
    }
  }, [showAddListModal]);

  useEffect(() => {
    try {
      const productsRef = ref(database, "products");

      onValue(
        productsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const itemsArray = Object.entries(data).map(([id, item]) => {
              return {
                id,
                ...item,
              };
            });
            setProducts(itemsArray);
          } else {
            setProducts([]);
          }
        },
        (error) => {
          console.error("Firebase listener error:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    try {
      const itemsPath = getItemsPath(user, currentListId);
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
    showQRModal,
    qrCodeData,
    showMembersModal,
    showInviteCodeModal,
    inviteCodeInput,
    userListColor,
    userListFont,

    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Refs and animations
    qrCodeRef,
    qrModalOpacity,

    // Functions
    setNewItem,
    setShowResults,
    setCurrentListId,
    setShowListDropdown,
    setShowAddListModal,
    setNewListName,
    setShowBottomSheet,
    setShowEditListModal,
    setEditListName,
    setShowQRModal,
    setQrCodeData,
    setShowMembersModal,
    setShowInviteCodeModal,
    setInviteCodeInput,
    setUserListColor,
    setUserListFont,

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
    sendEmailInvitation,
    showQRCode,
    closeQRModal,
    saveQRCodeToGallery,
    shareQRCode,

    openBottomSheet,
    closeBottomSheet,

    getCurrentListName,
  };
}
