import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ColorSelector from "@/components/profile/ColorSelector";
import FontSelector from "@/components/profile/FontSelector";
import LanguageSelector from "@/components/profile/LanguageSelector";
import Header from "@/components/ui/Header";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    listColor,
    listFont,
    language,
    handleColorSelect,
    handleFontSelect,
    handleLanguageSelect,
  } = useProfile(user);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={t("profile.settings")} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ColorSelector
          selectedColor={listColor}
          onColorSelect={handleColorSelect}
        />

        <FontSelector selectedFont={listFont} onFontSelect={handleFontSelect} />

        <LanguageSelector
          currentLanguage={language}
          onLanguageSelect={handleLanguageSelect}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  content: {
    flex: 1,
    paddingBottom: 100,
  },
});
