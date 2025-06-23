import * as ImagePicker from "expo-image-picker";
import { onValue, push, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { database } from "../../firebase";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  console.log("Products:", products);

  // Sort products by category
  const sortedProducts = [...products].sort((a, b) => {
    const categoryA = categoryOrder[a.category] || 999;
    const categoryB = categoryOrder[b.category] || 999;
    return categoryA - categoryB;
  });

  // Hent produkter fra Firebase
  useEffect(() => {
    const productsRef = ref(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert to array using the numeric indices as IDs
          const itemsArray = Object.entries(data).map(([index, item]) => ({
            id: index, // Use the numeric index as ID
            name: item.name,
            category: item.category,
            subcategory: item.subcategory || "",
            icon_url: item.icon_url || null,
          }));
          console.log("Fetched products:", itemsArray);
          setProducts(itemsArray);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error processing Firebase data:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        // Convert to base64 data URL
        const base64Image = `data:image/png;base64,${result.assets[0].base64}`;
        setProductImage(base64Image);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Fejl", "Kunne ikke vælge billede");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductName("");
    setProductCategory("");
    setProductSubcategory("");
    setProductImage(null);
    setIsModalVisible(true);
  };

  const openEditModal = (product) => {
    console.log("Opening edit modal for product:", product);
    if (!product || !product.id) {
      console.error("Invalid product data:", product);
      return;
    }

    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || "",
      icon_url: product.icon_url || null,
    });

    setProductName(product.name);
    setProductCategory(product.category);
    setProductSubcategory(product.subcategory || "");
    setProductImage(product.icon_url || null);
    setIsModalVisible(true);
  };

  console.log("Editing product:", editingProduct?.id);

  const handleSave = async () => {
    if (!productName.trim() || !productCategory.trim()) {
      Alert.alert("Fejl", "Navn og kategori er påkrævet");
      return;
    }

    setUploading(true);
    try {
      const productData = {
        name: productName.trim(),
        category: productCategory.trim(),
        subcategory: productSubcategory.trim(),
        icon_url: productImage || null,
      };

      console.log("Current editingProduct:", editingProduct);
      console.log("Product data to save:", productData);

      if (editingProduct && editingProduct.id !== undefined) {
        // Update existing product using the numeric index
        const productRef = ref(database, `products/${editingProduct.id}`);
        console.log(
          "Updating product at path:",
          `products/${editingProduct.id}`
        );
        await set(productRef, productData);
      } else {
        // Add new product - Firebase will automatically assign the next numeric index
        const productsRef = ref(database, "products");
        console.log("Creating new product");
        await push(productsRef, productData);
      }

      setIsModalVisible(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert("Fejl", "Kunne ikke gemme produktet");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (product) => {
    console.log("Deleting product:", product);
    Alert.alert(
      "Slet produkt",
      `Er du sikker på, at du vil slette "${product.name}"?`,
      [
        {
          text: "Annuller",
          style: "cancel",
        },
        {
          text: "Slet",
          style: "destructive",
          onPress: async () => {
            try {
              const productRef = ref(database, `products/${product.id}`);
              console.log(
                "Deleting product at path:",
                `products/${product.id}`
              );
              await remove(productRef);
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Fejl", "Kunne ikke slette produktet");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produkter</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>Tilføj produkt</Text>
      </TouchableOpacity>

      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            {item.icon_url && (
              <Image
                source={{ uri: item.icon_url }}
                style={styles.productImage}
              />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
              {item.subcategory && (
                <Text style={styles.productSubcategory}>
                  {item.subcategory}
                </Text>
              )}
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.actionButtonText}>Rediger</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.actionButtonText}>Slet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Rediger produkt" : "Tilføj produkt"}
            </Text>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              {productImage ? (
                <Image
                  source={{ uri: productImage }}
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Vælg billede</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Produktnavn"
            />

            <TextInput
              style={styles.input}
              value={productCategory}
              onChangeText={setProductCategory}
              placeholder="Kategori"
            />

            <TextInput
              style={styles.input}
              value={productSubcategory}
              onChangeText={setProductSubcategory}
              placeholder="Underkategori (valgfrit)"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={uploading}
              >
                <Text style={styles.modalButtonText}>Annuller</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={uploading}
              >
                <Text style={styles.modalButtonText}>
                  {uploading ? "Gemmer..." : "Gem"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  productSubcategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  productActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
  },
  saveButton: {
    backgroundColor: "#34c759",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  productImage: {
    width: 35,
    height: 35,
    marginRight: 12,
    padding: 5,
  },
  imagePickerButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "center",
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imagePlaceholderText: {
    color: "#666",
    fontSize: 14,
  },
});
