import { onValue, push, ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { database } from "../../firebase";

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  console.log("Safe Area Insets:", {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);

  // Define category order for sorting
  const categoryOrder = {
    "Frugt & Grønt": 1,
    "Kød & Fisk": 2,
    "Brød & Kager": 3,
    Mejeri: 4,
    Frost: 5,
    Tørvarer: 6,
    Drikkevarer: 7,
    "Snacks & Slik": 8,
    "Personlig Pleje": 9,
    Husholdning: 10,
  };

  // Sort items by category
  const sortedItems = [...items].sort((a, b) => {
    const categoryA = categoryOrder[a.category] || 999;
    const categoryB = categoryOrder[b.category] || 999;
    return categoryA - categoryB;
  });

  const hasCompletedItems = items.some((item) => item.completed);
  const hasItems = items.length > 0;

  // Hent produkter fra Firebase
  useEffect(() => {
    try {
      // Listen for changes in the database
      const productsRef = ref(database, "products");

      onValue(
        productsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const itemsArray = Object.entries(data).map(([id, item]) => {
              return {
                id,
                ...item,
              };
            });
            setProducts(itemsArray);
          } else {
            setProducts([]);
          }
        },
        (error) => {
          console.error("Firebase listener error:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  }, []);

  // Søgefunktion
  const handleSearch = (text) => {
    setNewItem(text);
    if (text.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Vælg produkt fra søgeresultater
  const selectProduct = (product) => {
    try {
      const itemsRef = ref(database, "shoppingItems");
      const newItemRef = push(itemsRef);
      set(newItemRef, {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        completed: false,
        icon_url: product.icon_url,
      })
        .then(() => {
          setNewItem("");
          setShowResults(false);
        })
        .catch((error) => {
          console.error("Error adding item:", error);
        });
    } catch (error) {
      console.error("Error in selectProduct:", error);
    }
  };

  const deleteCompletedItems = () => {
    Alert.alert(
      "Slet overstregede varer",
      "Er du sikker på, at du vil slette alle overstregede varer?",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const completedItems = items.filter((item) => item.completed);
            completedItems.forEach((item) => {
              const itemRef = ref(database, `shoppingItems/${item.id}`);
              remove(itemRef);
            });
          },
        },
      ]
    );
  };

  const deleteAllItems = () => {
    Alert.alert(
      "Slet alle varer",
      "Er du sikker på, at du vil slette alle varer?",
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const itemsRef = ref(database, "shoppingItems");
            remove(itemsRef);
          },
        },
      ]
    );
  };

  useEffect(() => {
    try {
      // Listen for changes in the database
      const itemsRef = ref(database, "shoppingItems");

      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const itemsArray = Object.entries(data).map(([id, item]) => ({
              id,
              ...item,
            }));
            setItems(itemsArray);
          } else {
            setItems([]);
          }
        },
        (error) => {
          console.error("Firebase listener error:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  }, []);

  const addItem = () => {
    if (newItem.trim()) {
      try {
        // Check if the entered text matches any product
        const matchingProduct = products.find(
          (product) =>
            product.name.toLowerCase() === newItem.trim().toLowerCase()
        );

        const itemsRef = ref(database, "shoppingItems");
        const newItemRef = push(itemsRef);
        set(newItemRef, {
          name: matchingProduct ? matchingProduct.name : newItem,
          category: matchingProduct ? matchingProduct.category : "",
          subcategory: matchingProduct ? matchingProduct.subcategory : "",
          completed: false,
          icon_url: matchingProduct ? matchingProduct.icon_url : "",
        })
          .then(() => {
            setNewItem("");
            setShowResults(false);
          })
          .catch((error) => {
            console.error("Error adding item:", error);
          });
      } catch (error) {
        console.error("Error in addItem:", error);
      }
    }
  };

  const toggleItem = (id) => {
    const itemRef = ref(database, `shoppingItems/${id}`);
    const item = items.find((item) => item.id === id);
    if (item) {
      update(itemRef, {
        completed: !item.completed,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Indkøbsliste</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={handleSearch}
          placeholder="Tilføj en vare..."
          onSubmitEditing={addItem}
          blurOnSubmit={false}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {showResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `search_${item.id}_${item.name}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => selectProduct(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.searchResultText}>{item.name}</Text>
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
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <FlatList
        data={sortedItems}
        style={styles.listContainer}
        keyExtractor={(item) => `item_${item.id}_${item.name}`}
        renderItem={({ item }) => (
          <View style={styles.noteLine}>
            <View style={styles.holeMargin}>
              <View style={styles.hole} />
            </View>

            <TouchableOpacity
              style={styles.item}
              onPress={() => toggleItem(item.id)}
            >
              <Text
                style={[
                  styles.itemText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.name}
              </Text>
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
          </View>
        )}
      />

      {hasItems && (
        <View style={[styles.deleteButtonsContainer]}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FFC0CB",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#FFC0CB",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "red",
  },
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
    padding: 10,
    borderRadius: 5,
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
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#fff89d",
    marginBottom: 60,
  },
  noteLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff89d",
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e1d96b",
  },
  holeMargin: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  hole: {
    width: 15,
    height: 15,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  searchResultsContainer: {
    position: "absolute",
    top: 165,
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
  },
  searchResultCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  productImage: {
    width: 25,
    height: 25,
    padding: 2,
    zIndex: 1000,
  },
});
