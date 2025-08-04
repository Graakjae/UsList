import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const colorOptions = [
  "#333",
  "#FFC0CB",
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#FF5252",
  "#795548",
  "#00BFAE",
  "#FFD600",
  "#607D8B",
  "#B388FF",
];

export default function ColorSelector({ selectedColor, onColorSelect }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>
        Vælg farve til teksten på indkøbslisten:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.colorOptionsScroll}
        contentContainerStyle={styles.colorOptionsRow}
      >
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle,
              {
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 1,
                borderColor: selectedColor === color ? "#FFC0CB" : "#ccc",
              },
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </ScrollView>
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
  colorOptionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    marginLeft: 4,
    paddingRight: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 0,
  },
  colorOptionsScroll: {
    marginBottom: 10,
    maxWidth: "100%",
  },
});
