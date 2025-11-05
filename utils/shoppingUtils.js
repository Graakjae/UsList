import { get, ref, set, update } from "firebase/database";
import { database } from "../firebase";

// Helper function to get translated text from product (works with direct language fields)
export const getTranslatedText = (product, field, language = "da") => {
  if (!product) return "";

  // For structure with direct language fields (e.g., {da: "Mælk", en: "Milk"})
  if (
    product[field] &&
    typeof product[field] === "object" &&
    product[field][language]
  ) {
    return product[field][language];
  }

  // Fallback til dansk hvis oversættelse ikke findes
  if (
    product[field] &&
    typeof product[field] === "object" &&
    product[field].da
  ) {
    return product[field].da;
  }

  // If it's a string, return it directly
  if (typeof product[field] === "string") {
    return product[field];
  }

  return "";
};

// Category order for sorting items - based on category IDs for multi-language support
export const categoryOrder = {
  "cat-produce": 1,
  "cat-meatfish": 2,
  "cat-chilled": 3,
  "cat-bread": 4,
  "cat-cakes": 5,
  "cat-dairy": 6,
  "cat-frozen": 7,
  "cat-dry": 8,
  "cat-beverages": 9,
  "cat-alcohol": 10,
  "cat-snacks": 11,
  "cat-personal": 12,
  "cat-household": 13,
  "cat-colonial": 14,
  "cat-pet": 15,
  "cat-other": 16,
};

// Category translations
export const categoryTranslations = {
  da: {
    "Frugt & Grønt": "Frugt & Grønt",
    "Kød & Fisk": "Kød & Fisk",
    Brød: "Brød",
    Kager: "Kager",
    Mejeri: "Mejeri",
    Frost: "Frost",
    Tørvarer: "Tørvarer",
    Drikkevarer: "Drikkevarer",
    Snacks: "Snacks",
    "Personlig pleje": "Personlig pleje",
    Husholdning: "Husholdning",
    Kolonial: "Kolonial",
    Andet: "Andet",
  },
  en: {
    "Frugt & Grønt": "Fruit & Vegetables",
    "Kød & Fisk": "Meat & Fish",
    Brød: "Bread",
    Kager: "Cakes",
    Mejeri: "Dairy",
    Frost: "Frozen",
    Tørvarer: "Dry Goods",
    Drikkevarer: "Beverages",
    Snacks: "Snacks",
    "Personlig pleje": "Personal Care",
    Husholdning: "Household",
    Kolonial: "Pantry",
    Andet: "Other",
  },
};

export const stores = {
  Løvbjerg: { label: "Løvbjerg", name: "loebjerg" },
  Rema: { label: "Rema", name: "rema" },
  "Coop 365": { label: "Coop 365", name: "coop365" },
  Lidl: { label: "Lidl", name: "lidl" },
  Føtex: { label: "Føtex", name: "fotex" },
  Netto: { label: "Netto", name: "netto" },
  SuperBrugsen: { label: "SuperBrugsen", name: "superbrugsen" },
  Kvickly: { label: "Kvickly", name: "kvickly" },
  Salling: { label: "Salling", name: "salling" },
};

export const getAvailableStores = () => {
  return Object.entries(stores).map(([key, store]) => ({
    key,
    label: store.label,
    name: store.name,
  }));
};

// Units definitions
export const units = {
  g: { label: "g", name: "gram" },
  kg: { label: "kg", name: "kilogram" },
  liter: { label: "liter", name: "liter" },
};

// Get all available units as array
export const getAvailableUnits = () => {
  return Object.entries(units).map(([key, unit]) => ({
    key,
    label: unit.label,
    name: unit.name,
  }));
};

// Get unit label from key
export const getUnitLabel = (unitKey) => {
  return units[unitKey]?.label || unitKey;
};

// Category icons mapping - based on category IDs for multi-language support
export const categoryIcons = {
  "cat-produce": require("../assets/icons/categories/frugt-gront.png"),
  "cat-meatfish": require("../assets/icons/categories/kod-fisk.png"),
  "cat-chilled": require("../assets/icons/categories/chilled.png"),
  "cat-bread": require("../assets/icons/categories/brod.png"),
  "cat-cakes": require("../assets/icons/categories/kager.png"),
  "cat-dairy": require("../assets/icons/categories/mejeri.png"),
  "cat-frozen": require("../assets/icons/categories/frost.png"),
  "cat-dry": require("../assets/icons/categories/torvarer.png"),
  "cat-beverages": require("../assets/icons/categories/drikkevarer.png"),
  "cat-alcohol": require("../assets/icons/categories/drikkevarer.png"),
  "cat-snacks": require("../assets/icons/categories/snacks-slik.png"),
  "cat-personal": require("../assets/icons/categories/personlig-pleje.png"),
  "cat-household": require("../assets/icons/categories/husholdning.png"),
  "cat-colonial": require("../assets/icons/categories/kolonial.png"),
  "cat-pet": require("../assets/icons/categories/pet.png"),
  "cat-other": require("../assets/icons/categories/default-category-icon.png"),
};

// Get categories for current language
export const getCategoriesForLanguage = (language = "da") => {
  const translations =
    categoryTranslations[language] || categoryTranslations.da;

  return Object.keys(categoryOrder)
    .sort((a, b) => categoryOrder[a] - categoryOrder[b])
    .map((categoryKey) => ({
      key: categoryKey,
      label: translations[categoryKey] || categoryKey,
    }));
};

// Get category key from translated label
export const getCategoryKeyFromLabel = (label, language = "da") => {
  const translations =
    categoryTranslations[language] || categoryTranslations.da;

  for (const [key, translation] of Object.entries(translations)) {
    if (translation === label) {
      return key;
    }
  }

  // Fallback: return the label itself if no translation found
  return label;
};

// Get translated category name from category key
export const getTranslatedCategoryName = (categoryKey, language = "da") => {
  const translations =
    categoryTranslations[language] || categoryTranslations.da;
  return translations[categoryKey] || categoryKey;
};

// Get category icon from category ID
export const getCategoryIcon = (categoryId) => {
  if (!categoryId) {
    return require("../assets/icons/categories/default-category-icon.png");
  }

  // Direct match by category ID
  if (categoryIcons[categoryId]) {
    return categoryIcons[categoryId];
  }

  // Default icon
  return require("../assets/icons/categories/default-category-icon.png");
};

// New category structure functions
export const loadProductCategories = async (language = "da") => {
  try {
    const categoriesRef = ref(database, "product_categories");
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const categories = Object.values(data).map((category) => ({
        id: category.id,
        name: category.name[language] || category.name.da || category.name,
        label: category.name[language] || category.name.da || category.name,
        subcategories: category.subcategories
          ? Object.values(category.subcategories).map((sub) => ({
              id: sub.id,
              name: sub.name[language] || sub.name.da || sub.name,
              label: sub.name[language] || sub.name.da || sub.name,
            }))
          : [],
      }));
      return categories;
    }
    return [];
  } catch (error) {
    console.error("Error loading product categories:", error);
    return [];
  }
};

// Get category by ID
export const getCategoryById = async (categoryId, language = "da") => {
  try {
    const categoriesRef = ref(database, "product_categories");
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const category = Object.values(data).find((cat) => cat.id === categoryId);
      if (category) {
        return {
          id: category.id,
          name: category.name[language] || category.name.da || category.name,
          label: category.name[language] || category.name.da || category.name,
          subcategories: category.subcategories
            ? Object.values(category.subcategories).map((sub) => ({
                id: sub.id,
                name: sub.name[language] || sub.name.da || sub.name,
                label: sub.name[language] || sub.name.da || sub.name,
              }))
            : [],
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting category by ID:", error);
    return null;
  }
};

// Get subcategory by ID
export const getSubcategoryById = async (subcategoryId, language = "da") => {
  try {
    const categoriesRef = ref(database, "product_categories");
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const category of Object.values(data)) {
        if (category.subcategories) {
          const subcategory = Object.values(category.subcategories).find(
            (sub) => sub.id === subcategoryId
          );
          if (subcategory) {
            return {
              id: subcategory.id,
              name:
                subcategory.name[language] ||
                subcategory.name.da ||
                subcategory.name,
              label:
                subcategory.name[language] ||
                subcategory.name.da ||
                subcategory.name,
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting subcategory by ID:", error);
    return null;
  }
};

// New function to get categories from database, sorted by categoryOrder
export const getCategoriesForLanguageFromDB = async (language = "da") => {
  try {
    const categories = await loadProductCategories(language);

    // Sort categories based on categoryOrder using category IDs
    const sortedCategories = [...categories].sort((a, b) => {
      const orderA = categoryOrder[a.id] || 999;
      const orderB = categoryOrder[b.id] || 999;
      return orderA - orderB;
    });

    return sortedCategories.map((category) => ({
      key: category.id,
      label: category.name,
      id: category.id,
      name: category.name,
      subcategories: category.subcategories,
    }));
  } catch (error) {
    console.error("Error loading categories from DB:", error);
    return [];
  }
};

export const sortItemsByCategory = (items, language = "da") => {
  return [...items].sort((a, b) => {
    const categoryA = categoryOrder[a.category] || 999;
    const categoryB = categoryOrder[b.category] || 999;
    return categoryA - categoryB;
  });
};

// Clean text for URL usage
export const cleanTextForUrl = (text) => {
  return text
    .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

// Generate invite link
export const generateInviteLink = (user, currentListId, getCurrentListName) => {
  const timestamp = Date.now();
  const ownerName = user.displayName || user.email?.split("@")[0] || "Bruger";
  const listName = getCurrentListName();

  const cleanOwnerName = cleanTextForUrl(ownerName);
  const cleanListName = cleanTextForUrl(listName);

  // Use a different separator to avoid conflicts with underscores in listId
  // Encode the currentListId to handle special characters
  const encodedListId = encodeURIComponent(currentListId);
  const inviteCode = `${user.uid}|${encodedListId}|${timestamp}`;

  return `https://uslist.vercel.app/invite/${cleanOwnerName}/${cleanListName}/${timestamp}?code=${inviteCode}`;
};

// Get items path based on list type
export const getItemsPath = (user, currentListId) => {
  if (!currentListId) {
    return null; // No list selected
  }

  if (currentListId.includes("_")) {
    // Split on first underscore only to handle listIds that contain underscores
    const firstUnderscoreIndex = currentListId.indexOf("_");
    const ownerId = currentListId.substring(0, firstUnderscoreIndex);
    const listId = currentListId.substring(firstUnderscoreIndex + 1);

    // Additional check: ownerId should look like a Firebase UID (at least 20 characters, alphanumeric)
    if (ownerId.length >= 20 && /^[a-zA-Z0-9]+$/.test(ownerId)) {
      return `users/${ownerId}/shoppingItems/${listId}`;
    }
  }

  // Default to regular list (user's own list)
  return `users/${user.uid}/shoppingItems/${currentListId}`;
};

// Get item path based on list type
export const getItemPath = (user, currentListId, itemId) => {
  if (!currentListId) {
    return null; // No list selected
  } else if (currentListId.includes("_")) {
    // Split on first underscore only to handle listIds that contain underscores
    const firstUnderscoreIndex = currentListId.indexOf("_");
    const ownerId = currentListId.substring(0, firstUnderscoreIndex);
    const listId = currentListId.substring(firstUnderscoreIndex + 1);
    // Additional check: ownerId should look like a Firebase UID (at least 20 characters, alphanumeric)
    if (ownerId.length >= 20 && /^[a-zA-Z0-9]+$/.test(ownerId)) {
      return `users/${ownerId}/shoppingItems/${listId}/${itemId}`;
    }
  }

  // Default to regular list (user's own list)
  return `users/${user.uid}/shoppingItems/${currentListId}/${itemId}`;
};

// Check if item is completed
export const isItemCompleted = (items) => {
  return items.some((item) => item.completed);
};

// Check if list has items
export const hasItems = (items) => {
  return items.length > 0;
};

// Category Memory Functions
// Now stores category_id instead of category names for multi-language support

// Save category memory for a user (stores category_id)
export const saveCategoryMemory = async (userId, itemName, categoryId) => {
  try {
    const categoryMemoryRef = ref(
      database,
      `users/${userId}/categoryMemory/${itemName}`
    );
    await set(categoryMemoryRef, {
      category_id: categoryId,
      lastUsed: Date.now(),
    });
  } catch (error) {
    console.error("Error saving category memory:", error);
  }
};

// Update category memory (update timestamp) - stores category_id
export const updateCategoryMemory = async (userId, itemName, categoryId) => {
  try {
    const categoryMemoryRef = ref(
      database,
      `users/${userId}/categoryMemory/${itemName}`
    );
    const snapshot = await get(categoryMemoryRef);

    if (snapshot.exists()) {
      await update(categoryMemoryRef, {
        category_id: categoryId,
        lastUsed: Date.now(),
      });
    } else {
      // If doesn't exist, create new entry
      await saveCategoryMemory(userId, itemName, categoryId);
    }
  } catch (error) {
    console.error("Error updating category memory:", error);
  }
};

// Get category memory for an item
export const getCategoryMemory = async (userId, itemName) => {
  try {
    const categoryMemoryRef = ref(
      database,
      `users/${userId}/categoryMemory/${itemName}`
    );
    const snapshot = await get(categoryMemoryRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error getting category memory:", error);
    return null;
  }
};

// Get suggested category_id for an item based on memory
export const getSuggestedCategory = async (userId, itemName) => {
  try {
    const memory = await getCategoryMemory(userId, itemName);
    if (!memory) return null;

    // Support both old format (category) and new format (category_id)
    if (memory.category_id) {
      return memory.category_id;
    } else if (memory.category) {
      // Legacy support: return old category name (will need conversion to id)
      return memory.category;
    }
    return null;
  } catch (error) {
    console.error("Error getting suggested category:", error);
    return null;
  }
};
