// hooks/useProducts.js
import * as ImagePicker from "expo-image-picker";
import { onValue, push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import { getCategoriesForLanguage } from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useProducts() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(); // Tilføj i18n for at få adgang til nuværende sprog
  const [standardProducts, setStandardProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Get category order based on current language
  const getCategoryOrder = () => {
    const categories = getCategoriesForLanguage(i18n.language);
    const order = {};
    categories.forEach((category, index) => {
      order[category.label] = index + 1;
    });
    return order;
  };

  // Get available categories for current language
  const getAvailableCategories = () => {
    return getCategoriesForLanguage(i18n.language);
  };

  // Validate if category exists in current language
  const isValidCategory = (category) => {
    const availableCategories = getAvailableCategories();
    return availableCategories.some((cat) => cat.label === category);
  };

  // Get category options for dropdown/selection
  const getCategoryOptions = () => {
    return getAvailableCategories().map((cat) => ({
      label: cat.label,
      value: cat.label,
    }));
  };

  // Helper function til at hente oversat tekst
  const getTranslatedText = (product, field) => {
    const currentLanguage = i18n.language;

    // Først prøv at hente fra oversættelser
    if (product.translations && product.translations[currentLanguage]) {
      return product.translations[currentLanguage][field] || "";
    }

    // Fallback til dansk hvis oversættelse ikke findes
    if (product.translations && product.translations.da) {
      return product.translations.da[field] || "";
    }

    // Fallback til original felt (for bagudkompatibilitet)
    return product[field] || "";
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
            name: getTranslatedText(item, "name"),
            category: getTranslatedText(item, "category"),
            subcategory: getTranslatedText(item, "subcategory"),
            icon_url: item.icon_url || null,
            isStandard: true,
            createdBy: "system",
            translations: item.translations || null, // Behold oversættelser for fremtidig brug
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
  }, [i18n.language]); // Tilføj i18n.language som dependency så produkterne opdateres når sproget skifter

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
            name: getTranslatedText(item, "name"),
            category: getTranslatedText(item, "category"),
            subcategory: getTranslatedText(item, "subcategory"),
            icon_url: item.icon_url || null,
            isStandard: false,
            createdBy: user.uid,
            translations: item.translations || null, // Behold oversættelser for fremtidig brug
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
  }, [user?.uid, i18n.language]); // Tilføj i18n.language som dependency

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
      translations: product.translations || null,
    });

    // Hent oversat tekst for det nuværende sprog
    const currentLanguage = i18n.language;
    if (product.translations && product.translations[currentLanguage]) {
      setProductName(
        product.translations[currentLanguage].name || product.name
      );
      setProductCategory(
        product.translations[currentLanguage].category || product.category
      );
      setProductSubcategory(
        product.translations[currentLanguage].subcategory ||
          product.subcategory ||
          ""
      );
    } else if (product.translations && product.translations.da) {
      // Fallback til dansk hvis oversættelse for nuværende sprog ikke findes
      setProductName(product.translations.da.name || product.name);
      setProductCategory(product.translations.da.category || product.category);
      setProductSubcategory(
        product.translations.da.subcategory || product.subcategory || ""
      );
    } else {
      // Fallback til original felter
      setProductName(product.name);
      setProductCategory(product.category);
      setProductSubcategory(product.subcategory || "");
    }
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
        translations: {
          // Behold eksisterende oversættelser hvis vi redigerer
          ...(editingProduct?.translations || {}),
          // Altid inkluder dansk som fallback
          da: {
            name: productName.trim(),
            category: productCategory.trim(),
            subcategory: productSubcategory.trim(),
          },
          // Tilføj oversættelse for det aktuelle sprog hvis det ikke er dansk
          ...(i18n.language !== "da"
            ? {
                [i18n.language]: {
                  name: productName.trim(),
                  category: productCategory.trim(),
                  subcategory: productSubcategory.trim(),
                },
              }
            : {}),
        },
        icon_url: productImage || null,
        createdBy: user?.uid,
        isStandard: false,
        updatedAt: Date.now(),
      };

      console.log("Saving product data:", JSON.stringify(productData, null, 2));
      console.log("User UID:", user?.uid);
      console.log("Current language:", i18n.language);

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
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
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

    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || !user?.uid) return;

    try {
      // Extract the actual product ID from the combined ID
      const actualId = productToDelete.id.replace("user_", "");
      const productRef = ref(
        database,
        `users/${user.uid}/products/${actualId}`
      );
      await remove(productRef);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert(t("common.error"), t("products.deleteError"));
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const canEditProduct = (product) => {
    return !product.isStandard && product.createdBy === user?.uid;
  };

  const canDeleteProduct = (product) => {
    return !product.isStandard && product.createdBy === user?.uid;
  };

  const getSortedProducts = (products) => {
    const categoryOrder = getCategoryOrder();
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
    showDeleteModal,
    productToDelete,

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
    confirmDelete,
    cancelDelete,
    canEditProduct,
    canDeleteProduct,
    getSortedProducts,
    chooseProductImage,
    getAvailableCategories,
    isValidCategory,
    getCategoryOptions,
  };
}
