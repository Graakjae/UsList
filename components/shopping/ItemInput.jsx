import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getTranslatedText } from "../../utils/shoppingUtils";

export default function ItemInput({
  newItem,
  handleSearch,
  addItem,
  showResults,
  searchResults,
  selectProduct,
  currentListId,
  isEditing,
}) {
  const { t, i18n } = useTranslation();
  const MAX_LENGTH = 50;

  return (
    <>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={currentListId ? styles.input : styles.disabledInput}
            value={newItem}
            onChangeText={handleSearch}
            placeholder={t("shopping.addItem")}
            onSubmitEditing={addItem}
            blurOnSubmit={false}
            returnKeyType="done"
            editable={!isEditing}
            autoFocus={false}
            focusable={!isEditing}
            maxLength={MAX_LENGTH}
          />
          {newItem.length > 40 && (
            <Text style={styles.charCounterInInput}>
              {newItem.length} / {MAX_LENGTH}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={
            currentListId && newItem.trim()
              ? styles.addButton
              : styles.disabledAddButton
          }
          onPress={addItem}
          disabled={!currentListId || !newItem.trim() || isEditing}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {showResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => {
              const name = getTranslatedText(item, "name", i18n.language);
              return `search_${item.id}_${name}`;
            }}
            renderItem={({ item }) => {
              const productName = getTranslatedText(
                item,
                "name",
                i18n.language
              );
              return (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => selectProduct(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchResultText}>{productName}</Text>
                  {item.icon_url && (
                    <Image
                      source={
                        item.icon_url.startsWith("data:")
                          ? { uri: item.icon_url }
                          : {
                              uri: `data:image/png;base64,${
                                item.icon_url.split(",")[1]
                              }`,
                            }
                      }
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </>
  );
}

const styles = {
  inputContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    marginRight: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: "#FFC0CB",
    borderRadius: 8,
    padding: 12,
    paddingRight: 58,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  disabledInput: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    backgroundColor: "#f0f0f0",
    color: "#666",
    opacity: 0.5,
  },
  addButton: {
    backgroundColor: "#FFC0CB",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledAddButton: {
    backgroundColor: "#FFC0CB",
    opacity: 0.7,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#000",
    fontSize: 24,
    fontFamily: "Nunito-Bold",
  },
  searchResultsContainer: {
    position: "absolute",
    top: 180,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchResultText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  productImage: {
    width: 25,
    height: 25,
    padding: 2,
    zIndex: 1000,
  },
  disabledContainer: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  disabledText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#666",
  },
  charCounterInInput: {
    position: "absolute",
    right: 12,
    top: 16,
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#999",
    backgroundColor: "transparent",
  },
  charCounterWarning: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
};
