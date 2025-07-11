import { useAuth } from "@/hooks/useAuth";
import {
  faBars,
  faChevronDown,
  faDownload,
  faEdit,
  faEnvelope,
  faPlus,
  faQrcode,
  faShare,
  faTrash,
  faUsers,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
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
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import basketIcon from "../../assets/icons/basket.png";
import { database } from "../../firebase";

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
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

  // Debug effect for invite code modal
  useEffect(() => {
    console.log("Invite code modal state:", showInviteCodeModal);
  }, [showInviteCodeModal]);
  const qrCodeRef = useRef();
  const qrModalOpacity = useSharedValue(0);

  // Bottom sheet animation
  const translateY = useSharedValue(0);
  const sheetHeight = 400;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      const newTranslateY = context.startY + event.translationY;
      translateY.value = Math.max(0, newTranslateY);
    },
    onEnd: (event) => {
      if (event.velocityY > 500 || event.translationY > 100) {
        translateY.value = withSpring(sheetHeight, { damping: 20 });
        runOnJS(setShowBottomSheet)(false);
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    },
  });

  const openBottomSheet = () => {
    setShowBottomSheet(true);
    translateY.value = withSpring(0, { damping: 20 });
    // loadListMembers will be called when the modal opens
  };

  const closeBottomSheet = () => {
    translateY.value = withSpring(sheetHeight, { damping: 20 });
    setTimeout(() => setShowBottomSheet(false), 300);
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
      // Read from shared_lists node
      const sharedListsRef = ref(database, `shared_lists/${user.uid}`);

      // Use onValue for real-time updates
      const unsubscribe = onValue(sharedListsRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          // Convert to array format
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

  // Generate invite link
  const generateInviteLink = () => {
    const timestamp = Date.now();
    const ownerName = user.displayName || user.email?.split("@")[0] || "Bruger";
    const listName = getCurrentListName();

    // Clean up names for URL (remove special characters, replace spaces with dashes)
    const cleanOwnerName = ownerName
      .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const cleanListName = listName
      .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Include the original invite code for Firebase lookup
    const inviteCode = `${user.uid}_${currentListId}_${timestamp}`;

    // Generate a proper invitation link to the Vercel page
    return `https://list-invite-app.vercel.app/invite/${cleanOwnerName}/${cleanListName}/${timestamp}?code=${inviteCode}`;
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

  // Generate and show QR code
  const showQRCode = () => {
    const inviteLink = generateInviteLink();
    setQrCodeData(inviteLink);
    setShowQRModal(true);
    qrModalOpacity.value = withSpring(1, { damping: 15 });
    closeBottomSheet();
  };

  // Close QR modal with animation
  const closeQRModal = () => {
    qrModalOpacity.value = withSpring(0, { damping: 15 }, () => {
      runOnJS(setShowQRModal)(false);
    });
  };

  // Save QR code to gallery
  const saveQRCodeToGallery = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Tilladelse nødvendig",
          "Du skal give tilladelse til at gemme billeder i galleriet."
        );
        return;
      }

      // Capture QR code as image
      const uri = await qrCodeRef.current.capture();

      // Save to gallery
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

  // Edit list name
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

  // Remove user from list
  const removeUserFromList = (userId) => {
    if (!user || currentListId === "default") return;

    Alert.alert(
      "Fjern bruger",
      "Er du sikker på, at du vil fjerne denne bruger fra listen?",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
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

  // Define category order for sorting
  const categoryOrder = {
    "Frugt & Grønt": 1,
    "Kød & Fisk": 2,
    "Brød & Kager": 3,
    Mejeri: 4,
    Frost: 5,
    Tørvarer: 6,
    Drikkevarer: 7,
    "Snacks & Slik": 8,
    "Personlig Pleje": 9,
    Husholdning: 10,
  };

  // Sort items by category
  const sortedItems = [...items].sort((a, b) => {
    const categoryA = categoryOrder[a.category] || 999;
    const categoryB = categoryOrder[b.category] || 999;
    return categoryA - categoryB;
  });

  const hasCompletedItems = items.some((item) => item.completed);
  const hasItems = items.length > 0;

  // Get current list name
  const getCurrentListName = () => {
    if (currentListId === "default") return "Indkøbsliste";

    // Check if it's a shared list
    if (currentListId.includes("_")) {
      const sharedList = sharedLists.find((list) => list.id === currentListId);
      return sharedList ? `${sharedList.name} ` : "Liste";
    }

    const currentList = lists.find((list) => list.id === currentListId);
    return currentList ? currentList.name : "Indkøbsliste";
  };

  // Load lists
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

        // Set current list to first list if none selected
        if (currentListId === "default" && listsArray.length > 0) {
          setCurrentListId(listsArray[0].id);
        }
      } else {
        // No lists exist, create default "Indkøbsliste"
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

    // Load shared lists
    const sharedListsUnsubscribe = loadSharedLists();

    return () => {
      listsUnsubscribe();
      if (sharedListsUnsubscribe) {
        sharedListsUnsubscribe();
      }
    };
  }, [user]);

  // Load list members when bottom sheet opens
  useEffect(() => {
    if (showBottomSheet && user && currentListId !== "default") {
      loadListMembers();
    }
  }, [showBottomSheet, user, currentListId]);

  // Clear input field when add list modal opens
  useEffect(() => {
    if (showAddListModal) {
      setNewListName("");
    }
  }, [showAddListModal]);

  // Hent produkter fra Firebase
  useEffect(() => {
    try {
      // Listen for changes in the database
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

  // Søgefunktion
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

  // Vælg produkt fra søgeresultater
  const selectProduct = (product) => {
    if (!user) return;

    try {
      // Determine the correct path for items based on list type
      let itemsPath;
      if (currentListId === "default") {
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      } else if (currentListId.includes("_")) {
        // Shared list - add items to owner's database
        const [ownerId, listId] = currentListId.split("_");
        itemsPath = `users/${ownerId}/shoppingItems/${listId}`;
      } else {
        // User's own list
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      }

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);
      set(newItemRef, {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        completed: false,
        icon_url: product.icon_url,
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

  const deleteCompletedItems = () => {
    if (!user) return;

    Alert.alert(
      "Slet overstregede varer",
      "Er du sikker på, at du vil slette alle overstregede varer?",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const completedItems = items.filter((item) => item.completed);
            completedItems.forEach((item) => {
              // Determine the correct path for items based on list type
              let itemPath;
              if (currentListId === "default") {
                itemPath = `users/${user.uid}/shoppingItems/${currentListId}/${item.id}`;
              } else if (currentListId.includes("_")) {
                // Shared list - remove items from owner's database
                const [ownerId, listId] = currentListId.split("_");
                itemPath = `users/${ownerId}/shoppingItems/${listId}/${item.id}`;
              } else {
                // User's own list
                itemPath = `users/${user.uid}/shoppingItems/${currentListId}/${item.id}`;
              }

              const itemRef = ref(database, itemPath);
              remove(itemRef);
            });
          },
        },
      ]
    );
  };

  const deleteAllItems = () => {
    if (!user) return;

    Alert.alert(
      "Slet alle varer",
      "Er du sikker på, at du vil slette alle varer?",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            // Determine the correct path for items based on list type
            let itemsPath;
            if (currentListId === "default") {
              itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
            } else if (currentListId.includes("_")) {
              // Shared list - remove items from owner's database
              const [ownerId, listId] = currentListId.split("_");
              itemsPath = `users/${ownerId}/shoppingItems/${listId}`;
            } else {
              // User's own list
              itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
            }

            const itemsRef = ref(database, itemsPath);
            remove(itemsRef);
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!user) return;

    try {
      // Determine the correct path for items based on list type
      let itemsPath;
      if (currentListId === "default") {
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      } else if (currentListId.includes("_")) {
        // Shared list - get items from owner's database
        const [ownerId, listId] = currentListId.split("_");
        itemsPath = `users/${ownerId}/shoppingItems/${listId}`;
      } else {
        // User's own list
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      }

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

  const addItem = () => {
    if (!user || !newItem.trim()) return;

    try {
      // Check if the entered text matches any product
      const matchingProduct = products.find(
        (product) => product.name.toLowerCase() === newItem.trim().toLowerCase()
      );

      // Determine the correct path for items based on list type
      let itemsPath;
      if (currentListId === "default") {
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      } else if (currentListId.includes("_")) {
        // Shared list - add items to owner's database
        const [ownerId, listId] = currentListId.split("_");
        itemsPath = `users/${ownerId}/shoppingItems/${listId}`;
      } else {
        // User's own list
        itemsPath = `users/${user.uid}/shoppingItems/${currentListId}`;
      }

      const itemsRef = ref(database, itemsPath);
      const newItemRef = push(itemsRef);
      set(newItemRef, {
        name: matchingProduct ? matchingProduct.name : newItem,
        category: matchingProduct ? matchingProduct.category : "",
        subcategory: matchingProduct ? matchingProduct.subcategory : "",
        completed: false,
        icon_url: matchingProduct ? matchingProduct.icon_url : "",
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

  const toggleItem = (id) => {
    if (!user) return;

    // Determine the correct path for items based on list type
    let itemPath;
    if (currentListId === "default") {
      itemPath = `users/${user.uid}/shoppingItems/${currentListId}/${id}`;
    } else if (currentListId.includes("_")) {
      // Shared list - update items in owner's database
      const [ownerId, listId] = currentListId.split("_");
      itemPath = `users/${ownerId}/shoppingItems/${listId}/${id}`;
    } else {
      // User's own list
      itemPath = `users/${user.uid}/shoppingItems/${currentListId}/${id}`;
    }

    const itemRef = ref(database, itemPath);
    const item = items.find((item) => item.id === id);
    if (item) {
      update(itemRef, {
        completed: !item.completed,
      });
    }
  };

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

      // Clear input first, then close modal
      setNewListName("");

      // Automatically select the new list
      setCurrentListId(newListId);

      // Close modal after a short delay to ensure input is cleared
      setTimeout(() => {
        setShowAddListModal(false);
      }, 100);
    } catch (error) {
      console.error("Error adding list:", error);
      Alert.alert("Fejl", "Kunne ikke oprette ny liste");
    }
  };

  const deleteList = (listId) => {
    if (!user) return;

    Alert.alert(
      "Slet liste",
      "Er du sikker på, at du vil slette denne liste? Alle varer i listen vil også blive slettet.",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete list
              const listRef = ref(
                database,
                `users/${user.uid}/shoppingLists/${listId}`
              );
              await remove(listRef);

              // Delete all items in the list
              const itemsRef = ref(
                database,
                `users/${user.uid}/shoppingItems/${listId}`
              );
              await remove(itemsRef);

              // Check if this was the last list
              const remainingLists = lists.filter((list) => list.id !== listId);
              if (remainingLists.length === 0) {
                // Create a new default "Indkøbsliste"
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
                // Switch to the first remaining list
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

  // Handle shared list selection
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
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: sharedList.isOwner ? "Slet" : "Forlad",
          style: "destructive",
          onPress: async () => {
            try {
              if (sharedList.isOwner) {
                // Delete the entire list if user owns it
                const listRef = ref(
                  database,
                  `users/${user.uid}/shoppingLists/${sharedList.originalId}`
                );
                await remove(listRef);
              } else {
                // Remove user from the shared list
                const memberRef = ref(
                  database,
                  `users/${sharedList.ownerId}/shoppingLists/${sharedList.originalId}/members/${user.uid}`
                );
                await remove(memberRef);
              }

              // Also remove from shared_lists
              const sharedListRef = ref(
                database,
                `shared_lists/${user.uid}/${sharedList.id}`
              );
              await remove(sharedListRef);

              // Switch to default list if current list was affected
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

  // Handle manual invite code
  const handleManualInviteCode = async () => {
    if (!inviteCodeInput.trim()) return;

    try {
      // Parse invite code: userId_listId_timestamp
      const parts = inviteCodeInput.trim().split("_");
      if (parts.length < 3) {
        Alert.alert("Fejl", "Ugyldig invitation kode");
        return;
      }

      const [ownerName, listName, timestamp] = parts;

      // Clean up names for URL (remove special characters, replace spaces with dashes)
      const cleanOwnerName = ownerName
        .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const cleanListName = listName
        .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      // Check if the list exists
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

      // Check if user is already a member
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

      // Add user to the list members
      const userMemberRef = ref(
        database,
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}/members/${user.uid}`
      );
      console.log(
        "Attempting to add user to members at path:",
        `users/${user.uid}/shoppingLists/${cleanOwnerName}-${cleanListName}-${timestamp}/members/${user.uid}`
      );
      console.log("User data:", {
        email: user.email,
        displayName: user.displayName || user.email,
        joinedAt: Date.now(),
      });

      await set(userMemberRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        joinedAt: Date.now(),
      });

      // Also add to shared_lists for easier access
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

      // Automatically select the shared list
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.listSelector}
            onPress={() => setShowListDropdown(!showListDropdown)}
          >
            <Text style={styles.title}>{getCurrentListName()}</Text>
            <FontAwesomeIcon icon={faChevronDown} size={16} color="#333" />
          </TouchableOpacity>

          {showListDropdown && (
            <View style={styles.dropdownContainer}>
              {/* My Lists */}
              {lists.length > 0 && (
                <>
                  <View style={styles.dropdownSectionHeader}>
                    <Text style={styles.dropdownSectionText}>Mine lister</Text>
                  </View>
                  {lists.map((list) => (
                    <TouchableOpacity
                      key={list.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCurrentListId(list.id);
                        setShowListDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{list.name}</Text>
                      <TouchableOpacity
                        onPress={() => deleteList(list.id)}
                        style={styles.deleteListButton}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          size={14}
                          color="#F44336"
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Shared Lists */}
              {sharedLists.length > 0 && (
                <>
                  <View style={styles.dropdownSectionHeader}>
                    <Text style={styles.dropdownSectionText}>Delte lister</Text>
                  </View>
                  {sharedLists.map((sharedList) => (
                    <TouchableOpacity
                      key={sharedList.id}
                      style={styles.dropdownItem}
                      onPress={() => selectSharedList(sharedList)}
                    >
                      <View style={styles.sharedListItem}>
                        <Text style={styles.dropdownText}>
                          {sharedList.name}
                        </Text>
                        <Text style={styles.sharedListOwner}>
                          {sharedList.isOwner
                            ? "Du ejer denne liste"
                            : `Ejet af ${sharedList.ownerName}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => leaveSharedList(sharedList)}
                        style={styles.deleteListButton}
                      >
                        <FontAwesomeIcon
                          icon={sharedList.isOwner ? faTrash : faUserTimes}
                          size={14}
                          color="#F44336"
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <TouchableOpacity
                style={styles.addListButton}
                onPress={() => {
                  setShowAddListModal(true);
                  setShowListDropdown(false);
                }}
              >
                <FontAwesomeIcon icon={faPlus} size={14} color="#FFC0CB" />
                <Text style={styles.addListText}>Tilføj ny liste</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => router.push("/products")}
            style={styles.headerIconButton}
          >
            <Image source={basketIcon} style={styles.headerIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("Test: Opening invite modal directly");
              setShowInviteCodeModal(true);
            }}
            style={styles.headerIconButton}
          >
            <FontAwesomeIcon icon={faUsers} size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openBottomSheet}
            style={styles.headerIconButton}
          >
            <FontAwesomeIcon icon={faBars} size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={handleSearch}
          placeholder="Tilføj en vare..."
          onSubmitEditing={addItem}
          blurOnSubmit={false}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {showResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `search_${item.id}_${item.name}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => selectProduct(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.searchResultText}>{item.name}</Text>
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
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <FlatList
        data={sortedItems}
        style={styles.listContainer}
        keyExtractor={(item) => `item_${item.id}_${item.name}`}
        renderItem={({ item }) => (
          <View style={styles.noteLine}>
            <View style={styles.holeMargin}>
              <View style={styles.hole} />
            </View>

            <TouchableOpacity
              style={styles.item}
              onPress={() => toggleItem(item.id)}
            >
              <Text
                style={[
                  styles.itemText,
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
            </TouchableOpacity>
          </View>
        )}
      />

      {hasItems && (
        <View style={[styles.deleteButtonsContainer]}>
          {hasCompletedItems && (
            <TouchableOpacity
              style={[styles.deleteButton, styles.deleteCompletedButton]}
              onPress={deleteCompletedItems}
            >
              <Text style={styles.deleteButtonText}>Slet overstregede</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.deleteButton, styles.deleteAllButton]}
            onPress={deleteAllItems}
          >
            <Text style={styles.deleteButtonText}>Slet alle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add List Modal */}
      <Modal
        visible={showAddListModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddListModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opret ny liste</Text>

            <TextInput
              style={styles.modalInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Liste navn"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddListModal(false);
                  setNewListName("");
                  openBottomSheet();
                }}
              >
                <Text style={styles.modalButtonText}>Annuller</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewList}
              >
                <Text style={styles.modalButtonText}>Opret</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet */}
      <Modal
        visible={showBottomSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBottomSheet}
      >
        <GestureHandlerRootView>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.bottomSheet, animatedStyle]}>
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>
                  {getCurrentListName()}
                </Text>
                <TouchableOpacity onPress={closeBottomSheet}>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSheetContent}>
                {/* For all lists */}
                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={shareList}
                >
                  <FontAwesomeIcon icon={faShare} size={24} color="#333" />
                  <Text style={styles.bottomSheetItemText}>Del liste</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={sendEmailInvitation}
                >
                  <FontAwesomeIcon icon={faEnvelope} size={24} color="#333" />
                  <Text style={styles.bottomSheetItemText}>
                    Send e-mail invitation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={showQRCode}
                >
                  <FontAwesomeIcon icon={faQrcode} size={24} color="#333" />
                  <Text style={styles.bottomSheetItemText}>QR-kode</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={() => {
                    console.log("Opening invite code modal");
                    setShowInviteCodeModal(true);
                    closeBottomSheet();
                  }}
                >
                  <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
                  <Text style={styles.bottomSheetItemText}>
                    Tilslut dig liste
                  </Text>
                </TouchableOpacity>

                {/* Only for user-created lists */}
                {currentListId !== "default" &&
                  !currentListId.includes("_") && (
                    <>
                      <TouchableOpacity
                        style={styles.bottomSheetItem}
                        onPress={() => {
                          setEditListName(getCurrentListName());
                          setShowEditListModal(true);
                          closeBottomSheet();
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} size={24} color="#333" />
                        <Text style={styles.bottomSheetItemText}>
                          Rediger liste navn
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bottomSheetItem}
                        onPress={() => {
                          setShowMembersModal(true);
                          closeBottomSheet();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUsers}
                          size={24}
                          color="#333"
                        />
                        <Text style={styles.bottomSheetItemText}>
                          Brugere ({listMembers.length})
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bottomSheetItem}
                        onPress={() => deleteList(currentListId)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          size={24}
                          color="#F44336"
                        />
                        <Text
                          style={[
                            styles.bottomSheetItemText,
                            { color: "#F44336" },
                          ]}
                        >
                          Slet liste
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                {/* For shared lists - only show members */}
                {currentListId !== "default" && currentListId.includes("_") && (
                  <TouchableOpacity
                    style={styles.bottomSheetItem}
                    onPress={() => {
                      setShowMembersModal(true);
                      closeBottomSheet();
                    }}
                  >
                    <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
                    <Text style={styles.bottomSheetItemText}>
                      Brugere ({listMembers.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>

      {/* Edit List Name Modal */}
      {showEditListModal && (
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: showEditListModal ? 1 : 0, zIndex: 10000 },
          ]}
        >
          <View style={[styles.modalContainer]}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {currentListId === "default"
                  ? "Opret ny liste"
                  : "Rediger liste navn"}
              </Text>

              <TextInput
                style={styles.modalInput}
                value={editListName}
                onChangeText={setEditListName}
                placeholder="Liste navn"
                autoFocus={currentListId === "default"}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditListModal(false);
                    setEditListName("");
                    openBottomSheet();
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuller</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveListName}
                >
                  <Text style={styles.modalButtonText}>
                    {currentListId === "default" ? "Opret" : "Gem ændringer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <Animated.View
          style={[styles.qrModalOverlay, { opacity: qrModalOpacity }]}
        >
          <View style={styles.qrModalContent}>
            <Text style={styles.modalTitle}>QR-kode til invitation</Text>
            <Text style={styles.qrModalSubtitle}>
              Del denne QR-kode med andre for at invitere dem til "
              {getCurrentListName()}"
            </Text>

            <ViewShot ref={qrCodeRef} style={styles.qrCodeContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrCodeData}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
              </View>
            </ViewShot>

            <View style={styles.qrModalButtons}>
              <TouchableOpacity
                style={[styles.qrModalButton, styles.shareButton]}
                onPress={shareQRCode}
              >
                <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
                <Text style={styles.qrModalButtonText}>Del</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrModalButton, styles.saveButton]}
                onPress={saveQRCodeToGallery}
              >
                <FontAwesomeIcon icon={faDownload} size={20} color="#fff" />
                <Text style={styles.qrModalButtonText}>Gem</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeQRModal}>
              <Text style={styles.closeButtonText}>Luk</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: showMembersModal ? 1 : 0, zIndex: 10000 },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Liste medlemmer</Text>

              {listMembers.length > 0 ? (
                <FlatList
                  data={listMembers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {item.displayName || item.email || "Ukendt bruger"}
                        </Text>
                        <Text style={styles.memberEmail}>{item.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeMemberButton}
                        onPress={() => removeUserFromList(item.id)}
                      >
                        <FontAwesomeIcon
                          icon={faUserTimes}
                          size={16}
                          color="#F44336"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.membersList}
                />
              ) : (
                <Text style={styles.noMembersText}>
                  Ingen medlemmer på denne liste endnu
                </Text>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setShowMembersModal(false)}
              >
                <Text style={styles.modalButtonText}>Luk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Invite Code Modal */}
      {showInviteCodeModal && (
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: showInviteCodeModal ? 1 : 0, zIndex: 10000 },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tilslut dig liste</Text>

              <Text style={styles.modalSubtitle}>
                Indtast invitation koden du har modtaget
              </Text>

              <TextInput
                style={styles.modalInput}
                value={inviteCodeInput}
                onChangeText={setInviteCodeInput}
                placeholder="Indtast invitation kode"
                autoFocus
                autoCapitalize="none"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowInviteCodeModal(false);
                    setInviteCodeInput("");
                    openBottomSheet();
                  }}
                >
                  <Text style={styles.modalButtonText}>Annuller</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleManualInviteCode}
                >
                  <Text style={styles.modalButtonText}>Tilslut</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 40,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FFC0CB",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#FFC0CB",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Baloo2-Bold",
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "red",
    fontFamily: "Nunito-Regular",
  },
  deleteButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteCompletedButton: {
    backgroundColor: "#FFC0CB",
  },
  deleteAllButton: {
    backgroundColor: "#FFC0CB",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
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
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 6,
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
  searchResultsContainer: {
    position: "absolute",
    top: 180,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchResultText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  searchResultCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: "Nunito-Regular",
  },
  productImage: {
    width: 25,
    height: 25,
    padding: 2,
    zIndex: 1000,
  },
  titleContainer: {
    flex: 1,
    position: "relative",
  },
  listSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  deleteListButton: {
    padding: 4,
  },
  addListButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addListText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#FFC0CB",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10000,
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#FFC0CB",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  bottomSheetContent: {
    gap: 15,
  },
  bottomSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  bottomSheetItemText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  qrModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  qrModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  qrModalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  qrModalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  shareButton: {
    backgroundColor: "#4CAF50",
  },
  qrModalButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#fff",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  dropdownSectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownSectionText: {
    fontSize: 14,
    fontFamily: "Baloo2-Bold",
    color: "#666",
    textTransform: "uppercase",
  },
  sharedListItem: {
    flex: 1,
  },
  sharedListOwner: {
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#666",
    marginTop: 2,
  },
  membersList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  memberEmail: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    marginTop: 2,
  },
  removeMemberButton: {
    padding: 8,
  },
  noMembersText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10000,
    paddingHorizontal: 0,
  },
});
