// app/products.jsx
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/products/EmptyState";
import ProductItem from "../components/products/ProductItem";
import ProductModal from "../components/products/ProductModal";
import ProductTabs from "../components/products/ProductTabs";
import useProducts from "../hooks/useProducts";

export default function Products() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("user");

  const {
    standardProducts,
    userProducts,
    isModalVisible,
    editingProduct,
    productName,
    productCategory,
    productSubcategory,
    productImage,
    uploading,
    setProductName,
    setProductCategory,
    setProductSubcategory,
    setProductImage,
    setIsModalVisible,
    openAddModal,
    openEditModal,
    handleSave,
    handleDelete,
    canEditProduct,
    canDeleteProduct,
    getSortedProducts,
    chooseProductImage,
  } = useProducts();

  // Get current products based on active tab
  const currentProducts =
    activeTab === "user" ? userProducts : standardProducts;
  const sortedProducts = getSortedProducts(currentProducts);

  const renderEmptyState = () => {
    if (activeTab === "user" && userProducts.length === 0) {
      return <EmptyState onAddProduct={openAddModal} />;
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Administrer produkter</Text>
      </View>

      <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "user" && (
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
          <Text style={styles.addButtonText}>Tilføj mit produkt</Text>
        </TouchableOpacity>
      )}

      {renderEmptyState() || (
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductItem
              product={item}
              onEdit={openEditModal}
              onDelete={handleDelete}
              canEdit={canEditProduct(item)}
              canDelete={canDeleteProduct(item)}
            />
          )}
        />
      )}

      <ProductModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSave}
        editingProduct={editingProduct}
        productName={productName}
        setProductName={setProductName}
        productCategory={productCategory}
        setProductCategory={setProductCategory}
        productSubcategory={productSubcategory}
        setProductSubcategory={setProductSubcategory}
        productImage={productImage}
        setProductImage={setProductImage}
        uploading={uploading}
        chooseProductImage={chooseProductImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    flex: 1,
  },
  addButton: {
    backgroundColor: "#FFC0CB",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
  },
});
