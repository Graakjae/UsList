import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const languages = [
  { code: "da", name: "Dansk" },
  { code: "en", name: "English" },
];

export default function LanguageSelector({
  currentLanguage,
  onLanguageSelect,
}) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionLabel}>{t("profile.languageSelector")}</Text>
      <View style={styles.languageOptionsRow}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              {
                borderColor:
                  currentLanguage === language.code ? "#FFC0CB" : "#ccc",
              },
            ]}
            onPress={() => onLanguageSelect(language.code)}
          >
            <Text
              style={{
                fontSize: 16,
                color: currentLanguage === language.code ? "#FFC0CB" : "#333",
                fontFamily: "Baloo2-Medium",
              }}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Baloo2-Bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  languageOptionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginLeft: 4,
  },
  languageButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
});
