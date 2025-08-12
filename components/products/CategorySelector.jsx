import {
  getCategoriesForLanguage,
  getCategoryKeyFromLabel,
} from "@/utils/shoppingUtils";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategorySelector({
  selectedCategory,
  onCategorySelect,
  placeholder,
}) {
  const { t, i18n } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get categories for current language
  const categories = getCategoriesForLanguage(i18n.language);

  const handleCategorySelect = (category) => {
    // Convert translated label back to category key for storage
    const categoryKey = getCategoryKeyFromLabel(category.label, i18n.language);
    onCategorySelect(categoryKey);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedCategory && styles.placeholderText,
          ]}
        >
          {selectedCategory
            ? getCategoriesForLanguage(i18n.language).find(
                (cat) => cat.key === selectedCategory
              )?.label || selectedCategory
            : placeholder || t("products.selectCategory")}
        </Text>
        <FontAwesomeIcon icon={faChevronDown} size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("products.selectCategory")}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.categoriesList}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.key &&
                      styles.selectedCategoryItem,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.key &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.label}
                  </Text>
                  {selectedCategory === category.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#FFC0CB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCategoryItem: {
    backgroundColor: "#FFF0F5",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedCategoryText: {
    color: "#FF69B4",
    fontFamily: "Baloo2-Bold",
  },
  checkmark: {
    fontSize: 16,
    color: "#FF69B4",
    fontFamily: "Baloo2-Bold",
  },
});
