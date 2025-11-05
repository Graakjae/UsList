// hooks/useProducts.js
import * as ImagePicker from "expo-image-picker";
import { onValue, push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { database } from "../firebase";
import {
  categoryOrder,
  getCategoriesForLanguageFromDB,
  getTranslatedText,
} from "../utils/shoppingUtils";
import { useAuth } from "./useAuth";

export default function useProducts() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [standardProducts, setStandardProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubcategory, setProductSubcategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Import categoryOrder from utils (now uses IDs)
  // No need for getCategoryOrder function anymore

  // Load product categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategoriesForLanguageFromDB(i18n.language);
        setProductCategories(categories);
      } catch (error) {
        console.error("Error loading product categories:", error);
        setProductCategories([]);
      }
    };
    loadCategories();
  }, [i18n.language]);

  // Get available categories for current language
  const getAvailableCategories = () => {
    return productCategories;
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

  // Helper function to get category name from category_id
  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !productCategories.length) return null;
    const category = productCategories.find((cat) => cat.id === categoryId);
    return category ? category.label || category.name : null;
  };

  // Helper function to get subcategory name from subcategory_id
  const getSubcategoryNameById = (subcategoryId, categoryId) => {
    if (!subcategoryId || !productCategories.length) return null;

    // Find the category first
    const category = productCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.subcategories) return null;

    // Find the subcategory
    const subcategory = category.subcategories.find(
      (sub) => sub.id === subcategoryId
    );
    return subcategory ? subcategory.label || subcategory.name : null;
  };

  // Load standard products
  useEffect(() => {
    const standardProductsRef = ref(database, "standard_products2");
    const unsubscribe = onValue(standardProductsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.entries(data).map(([index, item]) => ({
            id: `standard_${index}`,
            name: getTranslatedText(item, "name", i18n.language),
            category_id: item.category_id,
            subcategory_id: item.subcategory_id,
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
            name: getTranslatedText(item, "name", i18n.language),
            category: getTranslatedText(item, "category", i18n.language),
            subcategory: getTranslatedText(item, "subcategory", i18n.language),
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
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      icon_url: product.icon_url || null,
    });

    // Hent oversat tekst for produktnavn
    const productNameText = getTranslatedText(product, "name", i18n.language);
    setProductName(productNameText);

    // Get category and subcategory names from IDs
    let categoryName = "";
    let subcategoryName = "";

    if (product.category_id) {
      categoryName = getCategoryNameById(product.category_id) || "";
      if (product.subcategory_id) {
        subcategoryName =
          getSubcategoryNameById(product.subcategory_id, product.category_id) ||
          "";
      }
    }

    setProductCategory(categoryName);
    setProductSubcategory(subcategoryName);
    setProductImage(product.icon_url || null);
    setIsModalVisible(true);
  };

  // Helper function to convert category name to category_id
  const getCategoryIdFromName = (categoryName) => {
    if (!categoryName || !productCategories.length) return null;
    const category = productCategories.find(
      (cat) => (cat.label || cat.name) === categoryName
    );
    return category ? category.id : null;
  };

  // Helper function to convert subcategory name to subcategory_id
  const getSubcategoryIdFromName = (subcategoryName, categoryId) => {
    if (!subcategoryName || !productCategories.length) return null;

    // Find the category first
    const category = productCategories.find((cat) => cat.id === categoryId);
    if (!category || !category.subcategories) return null;

    // Find the subcategory
    const subcategory = category.subcategories.find(
      (sub) => (sub.label || sub.name) === subcategoryName
    );
    return subcategory ? subcategory.id : null;
  };

  const handleSave = async () => {
    if (!productName.trim() || !productCategory.trim()) {
      Alert.alert(t("common.error"), t("products.nameRequired"));
      return;
    }

    setUploading(true);
    try {
      // Convert category and subcategory names to IDs
      const categoryId = getCategoryIdFromName(productCategory.trim());
      const subcategoryId = categoryId
        ? getSubcategoryIdFromName(productSubcategory.trim(), categoryId)
        : null;

      const productData = {
        // New structure with direct language fields
        name: {
          da: productName.trim(),
          ...(i18n.language !== "da"
            ? { [i18n.language]: productName.trim() }
            : {}),
        },
        category_id: categoryId,
        subcategory_id: subcategoryId,
        icon_url: productImage || null,
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
    return [...products].sort((a, b) => {
      // Use category_id for sorting with categoryOrder (now uses IDs)
      const orderA = a.category_id ? categoryOrder[a.category_id] || 999 : 999;
      const orderB = b.category_id ? categoryOrder[b.category_id] || 999 : 999;
      return orderA - orderB;
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
