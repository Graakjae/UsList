import { get, onValue, ref, remove } from "firebase/database";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import { useAuth } from "./useAuth";

export default function useListMembers(currentListId, sharedLists) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // State
  const [listMembers, setListMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Helper function to get list path information
  const getListPathInfo = (currentListId, sharedLists, user) => {
    const sharedList = sharedLists.find((list) => list.id === currentListId);
    const isSharedList = !!sharedList;

    const ownerId = isSharedList ? sharedList.ownerId : user.uid;
    const listId = isSharedList ? sharedList.originalId : currentListId;

    return { sharedList, isSharedList, ownerId, listId };
  };

  // Helper function to fetch user data from database
  const fetchUserData = async (userId) => {
    try {
      const [displayNameSnapshot, photoURLSnapshot] = await Promise.all([
        get(ref(database, `users/${userId}/displayName`)),
        get(ref(database, `users/${userId}/photoURL`)),
      ]);

      return {
        displayName: displayNameSnapshot.exists()
          ? displayNameSnapshot.val()
          : "Ukendt bruger",
        photoURL: photoURLSnapshot.exists() ? photoURLSnapshot.val() : null,
      };
    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
      return { displayName: "Ukendt bruger", photoURL: null };
    }
  };

  // Helper function to create member object
  const createMemberObject = (id, member, userData) => ({
    id,
    ...member,
    displayName:
      userData.displayName ||
      member.displayName ||
      member.email ||
      "Ukendt bruger",
    photoURL: userData.photoURL || member.photoURL || null,
  });

  // Helper function to create owner member object
  const createOwnerMember = (
    ownerId,
    isSharedList,
    sharedList,
    user,
    userData
  ) => ({
    id: ownerId,
    displayName:
      userData.displayName ||
      (isSharedList
        ? sharedList.ownerName || ownerId || "Ukendt bruger"
        : user.displayName ||
          user.email?.split("@")[0] ||
          ownerId ||
          "Ukendt bruger"),
    email: isSharedList ? "" : user.email || "",
    photoURL:
      userData.photoURL || (isSharedList ? null : user.photoURL || null),
    isOwner: true,
    joinedAt: isSharedList ? sharedList.createdAt || Date.now() : Date.now(),
  });

  // Load list members
  const loadListMembers = () => {
    if (!user || !currentListId) return;

    try {
      // Get list path information
      const { sharedList, isSharedList, ownerId, listId } = getListPathInfo(
        currentListId,
        sharedLists,
        user
      );

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
              const userData = await fetchUserData(id);
              return createMemberObject(id, member, userData);
            })
          );
          membersArray = membersWithData;
        }

        // Add owner if not already present
        const ownerExists = membersArray.some(
          (member) => member.id === ownerId
        );
        if (!ownerExists) {
          const ownerUserData = await fetchUserData(ownerId);
          const ownerMember = createOwnerMember(
            ownerId,
            isSharedList,
            sharedList,
            user,
            ownerUserData
          );
          membersArray.unshift(ownerMember);
        }

        setListMembers(membersArray);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading list members:", error);
    }
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

  return {
    // State
    listMembers,
    setListMembers,
    showMembersModal,
    setShowMembersModal,

    // Functions
    loadListMembers,
    removeUserFromList,
  };
}
