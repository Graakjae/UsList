import {
  faArrowLeft,
  faLink,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";

export default function InviteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  const createInviteLink = async () => {
    if (!user) return;

    try {
      const inviteCode = generateInviteCode();
      const inviteUrl = `camillaogfrederiksapp://invite/${inviteCode}`;

      try {
        await Share.share({
          message: `Hej! Jeg vil gerne dele min indkøbsliste med dig. Brug denne invitation: ${inviteCode}`,
          url: inviteUrl,
        });
      } catch (error) {
        Alert.alert("Fejl", "Kunne ikke dele invitation");
      }
    } catch (error) {
      Alert.alert("Fejl", "Kunne ikke oprette invitation");
    }
  };

  const joinWithCode = async () => {
    if (!user || !inviteCode.trim()) return;

    Alert.alert("Succes", `Du har indtastet kode: ${inviteCode.toUpperCase()}`);
    setInviteCode("");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Del lister</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opret invitation</Text>
          <TouchableOpacity
            style={styles.createInviteButton}
            onPress={createInviteLink}
          >
            <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
            <Text style={styles.createInviteText}>Del min liste</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tilslut dig liste</Text>
          <View style={styles.joinContainer}>
            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Indtast invitationskode"
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={styles.joinButton} onPress={joinWithCode}>
              <FontAwesomeIcon icon={faLink} size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mine delte lister</Text>
          <Text style={styles.emptyText}>Du har ingen delte lister endnu</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  createInviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC0CB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  createInviteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  joinContainer: {
    flexDirection: "row",
    gap: 12,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 2,
  },
  joinButton: {
    backgroundColor: "#4CAF50",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
});
