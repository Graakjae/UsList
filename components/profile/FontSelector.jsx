import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

export default function FontSelector({ selectedFont, onFontSelect }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>
        Vælg skrifttype til indkøbslisten:
      </Text>
      <View style={styles.fontOptionsRow}>
        {fontOptions.map((font) => (
          <TouchableOpacity
            key={font.value}
            style={[
              styles.fontButton,
              { borderColor: selectedFont === font.value ? "#FFC0CB" : "#ccc" },
            ]}
            onPress={() => onFontSelect(font.value)}
          >
            <Text
              style={{
                fontFamily: font.fontFamily,
                fontSize: 18,
                color: selectedFont === font.value ? "#FFC0CB" : "#333",
              }}
            >
              Indkøbsliste
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
