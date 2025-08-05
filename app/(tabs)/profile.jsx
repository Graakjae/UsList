import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ColorSelector from "@/components/profile/ColorSelector";
import EditProfileModal from "@/components/profile/EditProfileModal";
import FontSelector from "@/components/profile/FontSelector";
import LanguageSelector from "@/components/profile/LanguageSelector";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMenu from "@/components/profile/ProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const {
    // State
    displayName,
    loading,
    listColor,
    listFont,
    language,
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
    handleLanguageSelect,
  } = useProfile(user);

  const handleSignOut = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
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

      <LanguageSelector
        currentLanguage={language}
        onLanguageSelect={handleLanguageSelect}
      />

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
