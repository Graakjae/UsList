import { faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileHeader({
  image,
  displayName,
  email,
  onEditPress,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.profileSection}>
      <View style={styles.imageContainer}>
        <Image
          source={
            image
              ? { uri: image }
              : require("../../assets/images/default_user_icon.png")
          }
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={onEditPress}>
          <FontAwesomeIcon icon={faUserEdit} size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.nameSection}>
        <View style={styles.nameContainer}>
          <Text style={styles.displayName}>
            {displayName || t("profile.noName")}
          </Text>
        </View>
      </View>

      <Text style={styles.email}>{email || t("profile.anonymousUser")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  email: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Baloo2-Regular",
  },
});
