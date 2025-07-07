import {
  faCamera,
  faCog,
  faShare,
  faSignOutAlt,
  faUserEdit,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { ref as dbRef, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { database } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
    console.log("User:", user);
  }, [user]);

  const updateProfile = async () => {
    try {
      setLoading(true);

      // Opdater Firebase Auth user's displayName
      await updateAuthProfile(user, {
        displayName: displayName,
      });

      // Opdater Realtime Database
      await set(dbRef(database, `users/${user.uid}/displayName`), displayName);

      setIsEditing(false);
      Alert.alert("Succes", "Profil opdateret");
    } catch (error) {
      Alert.alert("Fejl", "Kunne ikke opdatere profil");
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Log ud", "Er du sikker på, at du vil logge ud?", [
      { text: "Annuller", style: "cancel" },
      { text: "Log ud", style: "destructive", onPress: signOut },
    ]);
    router.replace("/login");
  };

  const shareInviteLink = () => {
    router.push("/invite");
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <FontAwesomeIcon icon={faCamera} size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nameSection}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Dit navn"
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>Gem</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.displayName}>
                {displayName || "Ingen navn"}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <FontAwesomeIcon icon={faUserEdit} size={16} color="#FFC0CB" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.email}>{user?.email || "Anonym bruger"}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={shareInviteLink}>
          <FontAwesomeIcon icon={faShare} size={20} color="#333" />
          <Text style={styles.menuText}>Del invitation</Text>
          <FontAwesomeIcon icon={faUsers} size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon icon={faCog} size={20} color="#333" />
          <Text style={styles.menuText}>Indstillinger</Text>
          <FontAwesomeIcon icon={faUsers} size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <FontAwesomeIcon icon={faSignOutAlt} size={20} color="#ff4444" />
          <Text style={[styles.menuText, { color: "#ff4444" }]}>Log ud</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFC0CB",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFC0CB",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  nameSection: {
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    padding: 8,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#FFC0CB",
    paddingBottom: 4,
    minWidth: 150,
  },
  saveButton: {
    backgroundColor: "#FFC0CB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
});
