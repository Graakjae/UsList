import { get, ref, set, update } from "firebase/database";
import { database } from "../firebase";

// Category order for sorting items
export const categoryOrder = {
  "Frugt & Grønt": 1,
  "Kød & Fisk": 2,
  Brød: 3,
  Kager: 4,
  Mejeri: 4,
  Frost: 5,
  Tørvarer: 6,
  Drikkevarer: 7,
  Snacks: 8,
  "Personlig pleje": 9,
  Husholdning: 10,
  Kolonial: 11,
  Andet: 12,
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

// Category icons mapping
export const categoryIcons = {
  "Frugt & Grønt": require("../assets/icons/categories/frugt-gront.png"),
  "Kød & Fisk": require("../assets/icons/categories/kod-fisk.png"),
  Brød: require("../assets/icons/categories/brod.png"),
  Kager: require("../assets/icons/categories/kager.png"),
  Mejeri: require("../assets/icons/categories/mejeri.png"),
  Frost: require("../assets/icons/categories/frost.png"),
  Tørvarer: require("../assets/icons/categories/torvarer.png"),
  Drikkevarer: require("../assets/icons/categories/default-category-icon.png"),
  Snacks: require("../assets/icons/categories/snacks-slik.png"),
  "Personlig pleje": require("../assets/icons/categories/personlig-pleje.png"),
  Husholdning: require("../assets/icons/categories/husholdning.png"),
  Kolonial: require("../assets/icons/categories/kolonial.png"),
  Andet: require("../assets/icons/categories/default-category-icon.png"),
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

// Get category icon from category key
export const getCategoryIcon = (categoryKey) => {
  return (
    categoryIcons[categoryKey] ||
    require("../assets/icons/categories/default-category-icon.png")
  );
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
  const inviteCode = `${user.uid}_${currentListId}_${timestamp}`;

  return `https://list-invite-app.vercel.app/invite/${cleanOwnerName}/${cleanListName}/${timestamp}?code=${inviteCode}`;
};

// Get items path based on list type
export const getItemsPath = (user, currentListId) => {
  if (!currentListId) {
    return null; // No list selected
  } else if (
    currentListId.includes("_") &&
    currentListId.split("_").length === 2
  ) {
    // Only treat as shared list if it has exactly one underscore and looks like "ownerId_listId"
    const [ownerId, listId] = currentListId.split("_");
    // Additional check: ownerId should look like a Firebase UID (28 characters, alphanumeric)
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
  } else if (
    currentListId.includes("_") &&
    currentListId.split("_").length === 2
  ) {
    // Only treat as shared list if it has exactly one underscore and looks like "ownerId_listId"
    const [ownerId, listId] = currentListId.split("_");
    // Additional check: ownerId should look like a Firebase UID (28 characters, alphanumeric)
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

// Save category memory for a user
export const saveCategoryMemory = async (userId, itemName, category) => {
  try {
    const categoryMemoryRef = ref(
      database,
      `users/${userId}/categoryMemory/${itemName}`
    );
    await set(categoryMemoryRef, {
      category: category,
      lastUsed: Date.now(),
    });
  } catch (error) {
    console.error("Error saving category memory:", error);
  }
};

// Update category memory (update timestamp)
export const updateCategoryMemory = async (userId, itemName, category) => {
  try {
    const categoryMemoryRef = ref(
      database,
      `users/${userId}/categoryMemory/${itemName}`
    );
    const snapshot = await get(categoryMemoryRef);

    if (snapshot.exists()) {
      await update(categoryMemoryRef, {
        category: category,
        lastUsed: Date.now(),
      });
    } else {
      // If doesn't exist, create new entry
      await saveCategoryMemory(userId, itemName, category);
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

// Get suggested category for an item based on memory
export const getSuggestedCategory = async (userId, itemName) => {
  try {
    const memory = await getCategoryMemory(userId, itemName);
    return memory ? memory.category : null;
  } catch (error) {
    console.error("Error getting suggested category:", error);
    return null;
  }
};
