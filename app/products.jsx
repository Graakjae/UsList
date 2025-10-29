// app/products.jsx
import Header from "@/components/ui/Header";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/products/EmptyState";
import ProductItem from "../components/products/ProductItem";
import ProductModal from "../components/products/ProductModal";
import ProductTabs from "../components/products/ProductTabs";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import useProducts from "../hooks/useProducts";

export default function Products() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
    showDeleteModal,
    productToDelete,
    setProductName,
    setProductCategory,
    setProductSubcategory,
    setProductImage,
    setIsModalVisible,
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
      <Header title={t("products.title")} />

      <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "user" && (
        <>
          <Button
            variant="primary"
            onPress={openAddModal}
            disabled={uploading}
            icon={faPlus}
          >
            {t("products.addProduct")}
          </Button>
        </>
      )}

      {renderEmptyState() || (
        <FlatList
          style={styles.list}
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
        onChooseImage={chooseProductImage}
        newImage={productImage}
      />

      <Modal
        visible={showDeleteModal}
        onClose={cancelDelete}
        title={t("products.deleteProduct")}
        buttons={[
          {
            text: t("common.cancel"),
            variant: "secondary",
            onPress: cancelDelete,
          },
          {
            text: t("common.delete"),
            variant: "delete",
            onPress: confirmDelete,
          },
        ]}
      >
        <Text style={styles.deleteText}>
          {t("products.deleteProductConfirm")} "{productToDelete?.name}"?
        </Text>
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
  list: {
    marginTop: 18,
  },
  deleteText: {
    fontSize: 16,
    fontFamily: "Baloo2-Regular",
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
  },
});
