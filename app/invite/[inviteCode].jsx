import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function InviteCodeScreen() {
  const { inviteCode } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !inviteCode) {
      router.replace("/(tabs)");
      return;
    }

    // For now, just show a success message and redirect
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);
  }, [user, inviteCode, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFC0CB" />
      <Text style={styles.text}>Behandler invitation...</Text>
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
