import { Text, TouchableOpacity, View } from "react-native";

export default function DeleteButtons({
  hasItems,
  hasCompletedItems,
  deleteCompletedItems,
  deleteAllItems,
}) {
  if (!hasItems) return null;

  return (
    <View style={styles.deleteButtonsContainer}>
      {hasCompletedItems && (
        <TouchableOpacity
          style={[styles.deleteButton, styles.deleteCompletedButton]}
          onPress={deleteCompletedItems}
        >
          <Text style={styles.deleteButtonText}>Slet overstregede</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.deleteButton, styles.deleteAllButton]}
        onPress={deleteAllItems}
      >
        <Text style={styles.deleteButtonText}>Slet alle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  deleteButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteCompletedButton: {
    backgroundColor: "#FFC0CB",
  },
  deleteAllButton: {
    backgroundColor: "#FFC0CB",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
  },
};
