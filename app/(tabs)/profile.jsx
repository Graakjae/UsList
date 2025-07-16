import {
  Baloo2_700Bold,
  useFonts as useBaloo2,
} from "@expo-google-fonts/baloo-2";
import {
  Caveat_400Regular,
  useFonts as useCaveat,
} from "@expo-google-fonts/caveat";
import {
  IndieFlower_400Regular,
  useFonts as useIndieFlower,
} from "@expo-google-fonts/indie-flower";
import {
  Nunito_400Regular,
  useFonts as useNunito,
} from "@expo-google-fonts/nunito";
import {
  PermanentMarker_400Regular,
  useFonts as usePermanentMarker,
} from "@expo-google-fonts/permanent-marker";
import {
  SpaceMono_400Regular,
  useFonts as useSpaceMono,
} from "@expo-google-fonts/space-mono";
import {
  faCamera,
  faCog,
  faSignOutAlt,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { ref as dbRef, get, set } from "firebase/database";
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
  const [listColor, setListColor] = useState("#333");
  const [listFont, setListFont] = useState("Baloo2-Bold");
  const fontOptions = [
    { label: "Baloo2", value: "Baloo2-Bold", fontFamily: "Baloo2-Bold" },
    { label: "Nunito", value: "Nunito-Regular", fontFamily: "Nunito-Regular" },
    {
      label: "SpaceMono",
      value: "SpaceMono-Regular",
      fontFamily: "SpaceMono-Regular",
    },
    {
      label: "Indie Flower",
      value: "IndieFlower-Regular",
      fontFamily: "IndieFlower-Regular",
    },
    { label: "Caveat", value: "Caveat-Regular", fontFamily: "Caveat-Regular" },
    {
      label: "Permanent Marker",
      value: "PermanentMarker-Regular",
      fontFamily: "PermanentMarker-Regular",
    },
  ];
  const colorOptions = [
    "#333",
    "#FFC0CB",
    "#4CAF50",
    "#2196F3",
    "#FF9800",
    "#9C27B0",
    "#FF5252",
    "#795548",
    "#00BFAE",
    "#FFD600",
    "#607D8B",
    "#B388FF",
  ];

  // Load fonts
  const [balooLoaded] = useBaloo2({ Baloo2_700Bold });
  const [nunitoLoaded] = useNunito({ Nunito_400Regular });
  const [spaceMonoLoaded] = useSpaceMono({ SpaceMono_400Regular });
  const [indieLoaded] = useIndieFlower({ IndieFlower_400Regular });
  const [caveatLoaded] = useCaveat({ Caveat_400Regular });
  const [markerLoaded] = usePermanentMarker({ PermanentMarker_400Regular });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      // Hent farvevalg fra Firebase
      const colorRef = dbRef(database, `users/${user.uid}/settings/listColor`);
      get(colorRef).then((snapshot) => {
        if (snapshot.exists()) {
          setListColor(snapshot.val());
        }
      });
      // Hent fontvalg fra Firebase
      const fontRef = dbRef(database, `users/${user.uid}/settings/listFont`);
      get(fontRef).then((snapshot) => {
        if (snapshot.exists()) {
          setListFont(snapshot.val());
        }
      });
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

  const handleColorSelect = async (color) => {
    setListColor(color);
    if (user) {
      await set(dbRef(database, `users/${user.uid}/settings/listColor`), color);
    }
  };

  const handleFontSelect = async (font) => {
    setListFont(font);
    if (user) {
      await set(dbRef(database, `users/${user.uid}/settings/listFont`), font);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Log ud", "Er du sikker på, at du vil logge ud?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Log ud",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/login");
        },
      },
    ]);
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
        {/* Farvevalg til indkøbslisten */}
        <Text style={styles.sectionLabel}>Vælg farve til indkøbslisten:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.colorOptionsScroll}
          contentContainerStyle={styles.colorOptionsRow}
        >
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: color,
                  borderWidth: listColor === color ? 3 : 1,
                  borderColor: listColor === color ? "#FFC0CB" : "#ccc",
                },
              ]}
              onPress={() => handleColorSelect(color)}
            />
          ))}
        </ScrollView>
        {/* Fontvalg til indkøbslisten */}
        <Text style={styles.sectionLabel}>
          Vælg skrifttype til indkøbslisten:
        </Text>
        <View style={styles.fontOptionsRow}>
          {fontOptions.map((font) => (
            <TouchableOpacity
              key={font.value}
              style={[
                styles.fontButton,
                { borderColor: listFont === font.value ? "#FFC0CB" : "#ccc" },
              ]}
              onPress={() => handleFontSelect(font.value)}
            >
              <Text
                style={{
                  fontFamily: font.fontFamily,
                  fontSize: 18,
                  color: listFont === font.value ? "#FFC0CB" : "#333",
                }}
              >
                Indkøbsliste
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <FontAwesomeIcon icon={faCog} size={20} color="#333" />
          <Text style={styles.menuText}>Indstillinger</Text>
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
    color: "#333",
    fontFamily: "Baloo2-Bold",
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
    color: "#333",
    fontFamily: "Baloo2-Bold",
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
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#FFC0CB",
    paddingBottom: 4,
    minWidth: 150,
    fontFamily: "Baloo2-Bold",
  },
  saveButton: {
    backgroundColor: "#FFC0CB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Baloo2-Bold",
  },
  email: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Baloo2-Regular",
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
    fontFamily: "Baloo2-Bold",
  },
  sectionLabel: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Baloo2-Bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  colorOptionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    marginLeft: 4,
    paddingRight: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 0,
  },
  colorOptionsScroll: {
    marginBottom: 10,
    maxWidth: "100%",
  },
  fontOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginLeft: 4,
  },
  fontButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
});
