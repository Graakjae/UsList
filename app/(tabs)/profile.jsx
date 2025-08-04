import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ColorSelector from "@/components/profile/ColorSelector";
import EditProfileModal from "@/components/profile/EditProfileModal";
import FontSelector from "@/components/profile/FontSelector";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMenu from "@/components/profile/ProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const {
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
  } = useProfile(user);

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
      <ProfileHeader
        image={image}
        displayName={displayName}
        email={user?.email}
        onEditPress={() => setIsEditingModal(true)}
      />

      <ColorSelector
        selectedColor={listColor}
        onColorSelect={handleColorSelect}
      />

      <FontSelector selectedFont={listFont} onFontSelect={handleFontSelect} />

      <ProfileMenu onSignOut={handleSignOut} />

      <EditProfileModal
        visible={isEditingModal}
        onClose={() => setIsEditingModal(false)}
        onSave={updateProfile}
        loading={loading}
        image={image}
        newImage={newImage}
        newDisplayName={newDisplayName}
        setNewDisplayName={setNewDisplayName}
        onChooseImage={chooseImage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
