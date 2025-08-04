import * as ImagePicker from "expo-image-picker";
import { ref as dbRef, get, set } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../firebase";

export default function useProfile(user) {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [listColor, setListColor] = useState("#333");
  const [listFont, setListFont] = useState("Baloo2-Bold");
  const [image, setImage] = useState("");
  const [newImage, setNewImage] = useState();
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [isEditingModal, setIsEditingModal] = useState(false);

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

  return {
    // State
    displayName,
    loading,
    listColor,
    listFont,
    image,
    newImage,
    newDisplayName,
    isEditingModal,

    // Functions
    setNewDisplayName,
    setIsEditingModal,
    chooseImage,
    updateProfile,
    handleColorSelect,
    handleFontSelect,
  };
}
