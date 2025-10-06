import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EditProfileModal from "@/components/profile/EditProfileModal";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMenu from "@/components/profile/ProfileMenu";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {
    // State
    displayName,
    loading,
    image,
    newImage,
    newDisplayName,
    isEditingModal,

    // Functions
    setNewDisplayName,
    setIsEditingModal,
    chooseImage,
    updateProfile,
  } = useProfile(user);

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = () => {
    signOut();
    router.replace("/login");
    setShowLogoutModal(false);
  };

  const handleManageProducts = () => {
    router.push("/products");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ProfileHeader
        image={image}
        displayName={displayName}
        email={user?.email}
        onEditPress={() => setIsEditingModal(true)}
      />

      <ProfileMenu
        onSignOut={handleSignOut}
        onManageProducts={handleManageProducts}
        onSettings={handleSettings}
      />

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

      <Modal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t("profile.logoutConfirm")}
        buttons={[
          {
            text: t("common.cancel"),
            onPress: () => setShowLogoutModal(false),
            style: { backgroundColor: "#f0f0f0" },
          },
          {
            text: t("profile.logout"),
            onPress: confirmSignOut,
            style: { backgroundColor: "#F44336" },
            textStyle: { color: "#fff" },
          },
        ]}
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
