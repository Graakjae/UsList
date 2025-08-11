import { useLocalSearchParams, useRouter } from "expo-router";
import { get, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { database } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

export default function InviteCodeScreen() {
  const { inviteCode } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    if (!user || !inviteCode) {
      router.replace("/(tabs)");
      return;
    }

    handleInvite();
  }, [user, inviteCode, router]);

  const handleInvite = async () => {
    try {
      setStatus("processing");

      // Parse invite code: userId_listId_timestamp
      const parts = inviteCode.split("_");
      if (parts.length < 3) {
        throw new Error("Ugyldig invitation");
      }

      const [ownerId, listId, timestamp] = parts;

      // Check if the list exists
      const listRef = ref(database, `users/${ownerId}/shoppingLists/${listId}`);
      const listSnapshot = await get(listRef);

      if (!listSnapshot.exists()) {
        throw new Error("Listen findes ikke længere");
      }

      const listData = listSnapshot.val();

      // Check if user is already a member
      const membersRef = ref(
        database,
        `users/${ownerId}/shoppingLists/${listId}/members`
      );
      const membersSnapshot = await get(membersRef);

      if (membersSnapshot.exists() && membersSnapshot.val()[user.uid]) {
        setStatus("already-member");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 3000);
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

      setStatus("success");

      // Redirect to the main app after 2 seconds
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 2000);
    } catch (error) {
      console.error("Error handling invite:", error);
      setStatus("error");

      Alert.alert(
        "Fejl",
        error.message || "Kunne ikke tilslutte dig listen. Prøv igen senere.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "processing":
        return "Behandler invitation...";
      case "success":
        return "Du er nu tilsluttet listen!";
      case "already-member":
        return "Du er allerede medlem af denne liste.";
      case "error":
        return "Der opstod en fejl. Prøv igen.";
      default:
        return "Behandler invitation...";
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFC0CB" />
      <Text style={styles.text}>{getStatusMessage()}</Text>
      <Text style={styles.codeText}>Kode: {inviteCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  codeText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
});
