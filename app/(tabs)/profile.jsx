import {
  faCog,
  faSignOutAlt,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import Modal from "@/components/ui/Modal";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listColor, setListColor] = useState("#333");
  const [listFont, setListFont] = useState("Baloo2-Bold");
  const [image, setImage] = useState("");
  const [newImage, setNewImage] = useState();
  const [newDisplayName, setNewDisplayName] = useState(displayName);

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

  useEffect(() => {
    if (user) {
      // Hent displayName fra Realtime Database
      const displayNameRef = dbRef(database, `users/${user.uid}/displayName`);
      get(displayNameRef).then((snapshot) => {
        if (snapshot.exists()) {
          setDisplayName(snapshot.val());
          setNewDisplayName(snapshot.val());
        } else {
          setDisplayName("");
        }
      });
      // Hent photoURL fra Realtime Database
      const photoURLRef = dbRef(database, `users/${user.uid}/photoURL`);
      get(photoURLRef).then((snapshot) => {
        if (snapshot.exists()) {
          setImage(snapshot.val());
          setNewImage(snapshot.val());
        } else {
          setImage("");
        }
      });
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
  }, [user]);
  console.log("Image:", image);
  console.log("NewImage:", newImage);

  async function chooseImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      quality: 0.3,
    });

    if (!result.canceled) {
      const base64 = "data:image/jpeg;base64," + result.assets[0].base64;
      setNewImage(base64);
    }
  }

  const updateProfile = async () => {
    setLoading(true);
    try {
      const userRef = dbRef(database, `users/${user.uid}`);
      await set(userRef, {
        displayName: newDisplayName,
        photoURL: newImage,
      });
      setImage(newImage);
      setDisplayName(newDisplayName);
      setIsEditingModal(false);
    } catch (error) {
      console.error("Error updating user data:", error);
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
            source={
              image ? { uri: image } : require("../../assets/images/icon.png")
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setIsEditingModal(true)}
          >
            <FontAwesomeIcon icon={faUserEdit} size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.nameSection}>
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>
              {displayName || "Ingen navn"}
            </Text>
          </View>
        </View>

        <Text style={styles.email}>{user?.email || "Anonym bruger"}</Text>
      </View>

      <View style={styles.menuSection}>
        {/* Farvevalg til indkøbslisten */}
        <Text style={styles.sectionLabel}>
          Vælg farve til teksten på indkøbslisten:
        </Text>
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
      <Modal
        visible={isEditingModal}
        onClose={() => setIsEditingModal(false)}
        title="Rediger profil"
        buttons={[
          {
            text: "Annuller",
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => setIsEditingModal(false),
            disabled: loading,
          },
          {
            text: "Gem",
            style: { backgroundColor: "#FFC0CB" },
            onPress: () => {
              updateProfile();
            },
            disabled: loading,
          },
        ]}
      >
        <View style={styles.editProfileContainer}>
          <Text style={styles.editProfileText}>Dit billede</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={chooseImage}
              disabled={loading}
              style={{ flex: 1 }}
            >
              <Image
                source={
                  image
                    ? { uri: newImage }
                    : require("../../assets/images/icon.png")
                }
                style={styles.profileImage}
              />

              {loading && (
                <Text style={{ textAlign: "center" }}>Uploader...</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.editProfileText}>Dit navn</Text>
          <View style={styles.editProfileInputContainer}>
            <TextInput
              style={styles.nameInput}
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Dit navn"
            />
          </View>
        </View>
      </Modal>
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
