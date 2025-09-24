import { onValue, ref, remove } from "firebase/database";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Share } from "react-native";
import { database } from "../firebase";
import { generateInviteLink as generateInviteLinkUtil } from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useInviteSystem(
  currentListId,
  getCurrentListName,
  lists,
  setCurrentListIdWithSave
) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // State
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [sharedLists, setSharedLists] = useState([]);

  // Generate invite link using utility function
  const generateInviteLink = () => {
    return generateInviteLinkUtil(user, currentListId, getCurrentListName);
  };

  // Share list
  const shareList = async () => {
    try {
      const inviteLink = generateInviteLink();
      await Share.share({
        message: `Hej! Du er inviteret til at deltage i min liste "${getCurrentListName()}". Klik på linket for at tilslutte dig: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing list:", error);
    }
  };

  // Load shared lists
  const loadSharedLists = () => {
    if (!user) return;

    try {
      const sharedListsRef = ref(database, `shared_lists/${user.uid}`);
      let listUnsubscribers = [];

      const unsubscribe = onValue(sharedListsRef, (snapshot) => {
        const data = snapshot.val();

        // Clean up existing list listeners
        listUnsubscribers.forEach((unsub) => unsub());
        listUnsubscribers = [];

        if (data) {
          // Set up listeners for each shared list to get real-time updates
          Object.entries(data).forEach(([sharedListKey, listData]) => {
            // Set up a listener for the actual list data
            const actualListRef = ref(
              database,
              `users/${listData.ownerId}/shoppingLists/${listData.originalId}`
            );

            const listUnsubscribe = onValue(actualListRef, (listSnapshot) => {
              if (listSnapshot.exists()) {
                const actualListData = listSnapshot.val();

                // Update the shared list with real data
                const updatedSharedList = {
                  id: sharedListKey, // This is already in ownerId_listId format
                  originalId: listData.originalId,
                  ownerId: listData.ownerId,
                  ownerName: listData.ownerName,
                  name: actualListData.name,
                  createdAt: actualListData.createdAt,
                  isShared: true,
                  isOwner: listData.isOwner,
                };

                // Update the local sharedLists state
                setSharedLists((prevLists) => {
                  const existingIndex = prevLists.findIndex(
                    (list) => list.id === sharedListKey
                  );
                  if (existingIndex >= 0) {
                    // Update existing list
                    const newLists = [...prevLists];
                    newLists[existingIndex] = updatedSharedList;
                    return newLists;
                  } else {
                    // Add new list
                    return [...prevLists, updatedSharedList];
                  }
                });
              } else {
                // List no longer exists, remove it from sharedLists
                setSharedLists((prevLists) =>
                  prevLists.filter((list) => list.id !== sharedListKey)
                );
              }
            });

            listUnsubscribers.push(listUnsubscribe);
          });
        } else {
          setSharedLists([]);
        }
      });

      // Return cleanup function that cleans up both the main listener and all list listeners
      return () => {
        unsubscribe();
        listUnsubscribers.forEach((unsub) => unsub());
      };
    } catch (error) {
      console.error("Error in loadSharedLists:", error);
    }
  };

  // Select shared list
  const selectSharedList = (sharedList) => {
    setCurrentListIdWithSave(sharedList.id);
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

              // Update state to remove the list from UI and handle navigation
              setSharedLists((prev) => {
                const updatedSharedLists = prev.filter(
                  (l) => l.id !== sharedList.id
                );

                // If this was the current list, select another list if available
                if (currentListId === sharedList.id) {
                  const remainingLists = lists.filter(
                    (l) => l.id !== sharedList.originalId
                  );

                  if (remainingLists.length > 0) {
                    setCurrentListIdWithSave(remainingLists[0].id);
                  } else if (updatedSharedLists.length > 0) {
                    setCurrentListIdWithSave(updatedSharedLists[0].id);
                  } else {
                    setCurrentListIdWithSave(null);
                  }
                }

                return updatedSharedLists;
              });
            } catch (error) {
              console.error("Error leaving/deleting shared list:", error);
              Alert.alert("Fejl", `Kunne ikke ${action} listen`);
            }
          },
        },
      ]
    );
  };

  return {
    // State
    showInviteCodeModal,
    setShowInviteCodeModal,
    inviteCodeInput,
    setInviteCodeInput,
    sharedLists,
    setSharedLists,

    // Functions
    generateInviteLink,
    shareList,
    loadSharedLists,
    selectSharedList,
    leaveSharedList,
  };
}
