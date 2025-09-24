import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { get, ref, set } from "firebase/database";
import { useEffect } from "react";
import { Alert } from "react-native";
import { database } from "../../../../firebase";

export default function InviteHandler() {
  const { ownerName, listName, timestamp, code } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!code || !user) return;

    const handleInvite = async () => {
      try {
        // Parse invite code: userId|listId|timestamp
        const parts = code.split("|");
        if (parts.length !== 3) {
          Alert.alert("Fejl", "Ugyldig invitation kode");
          router.replace("/");
          return;
        }

        const [ownerId, encodedListId, inviteTimestamp] = parts;
        const listId = decodeURIComponent(encodedListId);

        // Check if the list exists
        const listRef = ref(
          database,
          `users/${ownerId}/shoppingLists/${listId}`
        );
        const listSnapshot = await get(listRef);

        if (!listSnapshot.exists()) {
          Alert.alert("Fejl", "Listen findes ikke længere");
          router.replace("/");
          return;
        }

        const listData = listSnapshot.val();

        // Check if user is already a member
        const membersRef = ref(
          database,
          `users/${ownerId}/shoppingLists/${listId}/members`
        );
        const membersSnapshot = await get(membersRef);

        if (membersSnapshot.exists() && membersSnapshot.val()[user.uid]) {
          Alert.alert("Info", "Du er allerede medlem af denne liste");
          router.replace("/");
          return;
        }

        // Add user to the list members
        const userMemberRef = ref(
          database,
          `users/${ownerId}/shoppingLists/${listId}/members/${user.uid}`
        );

        await set(userMemberRef, {
          joinedAt: Date.now(),
        });

        // Also add to shared_lists for easier access
        const sharedListRef = ref(
          database,
          `shared_lists/${user.uid}/${ownerId}_${listId}`
        );
        await set(sharedListRef, {
          originalId: listId,
          ownerId: ownerId,
          ownerName: listData.ownerName || "Ukendt bruger",
          isShared: true,
          isOwner: false,
        });

        Alert.alert("Succes", "Du er nu tilsluttet listen!");

        // Navigate to the main app - the shared list will be auto-selected
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error handling invite:", error);
        Alert.alert("Fejl", "Kunne ikke tilslutte dig listen");
        router.replace("/");
      }
    };

    handleInvite();
  }, [code, user]);

  return null; // This component doesn't render anything
}
