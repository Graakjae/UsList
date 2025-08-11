// hooks/useProducts.js
import * as ImagePicker from "expo-image-picker";
import { onValue, push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import { useAuth } from "./useAuth";

export default function useProducts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [standardProducts, setStandardProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  // Load standard products
  useEffect(() => {
    const standardProductsRef = ref(database, "standard_products");
    const unsubscribe = onValue(standardProductsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([index, item]) => ({
            id: `standard_${index}`,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory || "",
            icon_url: item.icon_url || null,
            isStandard: true,
            createdBy: "system",
          }));
          setStandardProducts(itemsArray);
        } else {
          setStandardProducts([]);
        }
      } catch (error) {
        console.error("Error processing standard products:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user products
  useEffect(() => {
    if (!user?.uid) return;

    const userProductsRef = ref(database, `users/${user.uid}/products`);
    const unsubscribe = onValue(userProductsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([index, item]) => ({
            id: `user_${index}`,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory || "",
            icon_url: item.icon_url || null,
            isStandard: false,
            createdBy: user.uid,
          }));
          setUserProducts(itemsArray);
        } else {
          setUserProducts([]);
        }
      } catch (error) {
        console.error("Error processing user products:", error);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductName("");
    setProductCategory("");
    setProductSubcategory("");
    setProductImage(null);
    setIsModalVisible(true);
  };

  async function chooseProductImage() {
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        allowsEditing: true,
        quality: 0.3,
        mediaTypes: "images",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64 = "data:image/jpeg;base64," + result.assets[0].base64;
        setProductImage(base64);
      } else {
        console.log("Image selection was canceled or no assets");
      }
    } catch (error) {
      console.error("Error in chooseImage:", error);
      Alert.alert(t("common.error"), t("products.imageError"));
    }
  }

  const openEditModal = (product) => {
    if (!product || !product.id) {
      return;
    }

    // Check if user can edit this product
    if (product.isStandard) {
      Alert.alert(
        t("products.standardProduct"),
        t("products.cannotEditStandard"),
        [
          { text: t("common.ok"), style: "default" },
          {
            text: t("products.addProduct"),
            onPress: openAddModal,
          },
        ]
      );
      return;
    }

    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || "",
      icon_url: product.icon_url || null,
      createdBy: product.createdBy,
      isStandard: product.isStandard,
    });

    setProductName(product.name);
    setProductCategory(product.category);
    setProductSubcategory(product.subcategory || "");
    setProductImage(product.icon_url || null);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!productName.trim() || !productCategory.trim()) {
      Alert.alert(t("common.error"), t("products.nameRequired"));
      return;
    }

    setUploading(true);
    try {
      const productData = {
        name: productName.trim(),
        category: productCategory.trim(),
        subcategory: productSubcategory.trim(),
        icon_url: productImage || null,
        createdBy: user?.uid,
        isStandard: false,
        updatedAt: Date.now(),
      };

      if (editingProduct && editingProduct.id !== undefined) {
        // Extract the actual product ID from the combined ID
        const actualId = editingProduct.id.replace("user_", "");
        const productRef = ref(
          database,
          `users/${user.uid}/products/${actualId}`
        );
        await update(productRef, productData);
      } else {
        const userProductsRef = ref(database, `users/${user.uid}/products`);
        await push(userProductsRef, productData);
      }

      setIsModalVisible(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert(t("common.error"), t("products.saveError"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (product) => {
    // Check if user can delete this product
    if (product.isStandard) {
      Alert.alert(
        t("products.standardProduct"),
        t("products.cannotDeleteStandard")
      );
      return;
    }

    Alert.alert(
      t("products.deleteProduct"),
      `${t("products.deleteProductConfirm")} "${product.name}"?`,
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              // Extract the actual product ID from the combined ID
              const actualId = product.id.replace("user_", "");
              const productRef = ref(
                database,
                `users/${user.uid}/products/${actualId}`
              );
              await remove(productRef);
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert(t("common.error"), t("products.deleteError"));
            }
          },
        },
      ]
    );
  };

  const canEditProduct = (product) => {
    return !product.isStandard && product.createdBy === user?.uid;
  };

  const canDeleteProduct = (product) => {
    return !product.isStandard && product.createdBy === user?.uid;
  };

  const getSortedProducts = (products) => {
    return [...products].sort((a, b) => {
      const categoryA = categoryOrder[a.category] || 999;
      const categoryB = categoryOrder[b.category] || 999;
      return categoryA - categoryB;
    });
  };

  return {
    // State
    standardProducts,
    userProducts,
    isModalVisible,
    editingProduct,
    productName,
    productCategory,
    productSubcategory,
    productImage,
    uploading,

    // Setters
    setProductName,
    setProductCategory,
    setProductSubcategory,
    setProductImage,
    setIsModalVisible,

    // Functions
    openAddModal,
    openEditModal,
    handleSave,
    handleDelete,
    canEditProduct,
    canDeleteProduct,
    getSortedProducts,
    chooseProductImage,
  };
}
