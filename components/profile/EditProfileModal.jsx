import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  loading,
  image,
  newImage,
  newDisplayName,
  setNewDisplayName,
  onChooseImage,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t("profile.editProfile")}
      buttons={[
        {
          text: t("common.cancel"),
          style: { backgroundColor: "#f0f0f0" },
          onPress: onClose,
          disabled: loading,
        },
        {
          text: t("common.save"),
          style: { backgroundColor: "#FFC0CB" },
          textStyle: { color: "#fff" },
          onPress: onSave,
          disabled: loading,
        },
      ]}
    >
      <View style={styles.editProfileContainer}>
        <Text style={styles.editProfileText}>{t("profile.yourImage")}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              onChooseImage();
            }}
            style={{ flex: 1 }}
          >
            <Image
              style={styles.profileImage}
              source={
                newImage
                  ? { uri: newImage }
                  : image
                  ? { uri: image }
                  : require("../../assets/images/default_user_icon.png")
              }
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.editProfileText}>{t("profile.yourName")}</Text>
        <View style={styles.editProfileInputContainer}>
          <Input
            value={newDisplayName}
            onChangeText={setNewDisplayName}
            placeholder={t("profile.yourName")}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  editProfileContainer: {
    padding: 16,
  },
  editProfileText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Baloo2-Bold",
    marginBottom: 8,
  },
  editProfileInputContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFC0CB",
  },
});
