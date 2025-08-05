import { faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileMenu({ onSignOut }) {
  const { t } = useTranslation();

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity style={styles.menuItem}>
        <FontAwesomeIcon icon={faCog} size={20} color="#333" />
        <Text style={styles.menuText}>{t("profile.settings")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { marginBottom: 50 }]}
        onPress={onSignOut}
      >
        <FontAwesomeIcon icon={faSignOutAlt} size={20} color="#ff4444" />
        <Text style={[styles.menuText, { color: "#ff4444" }]}>
          {t("profile.logout")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
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
});
