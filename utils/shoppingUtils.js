import { get, ref, set, update } from "firebase/database";
import { database } from "../firebase";

// Category order for sorting items
export const categoryOrder = {
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
  Andet: 11,
};

// Category translations
export const categoryTranslations = {
  da: {
    "Frugt & Grønt": "Frugt & Grønt",
    "Kød & Fisk": "Kød & Fisk",
    "Brød & Kager": "Brød & Kager",
    Mejeri: "Mejeri",
    Frost: "Frost",
    Tørvarer: "Tørvarer",
    Drikkevarer: "Drikkevarer",
    "Snacks & Slik": "Snacks & Slik",
    "Personlig Pleje": "Personlig Pleje",
    Husholdning: "Husholdning",
    Andet: "Andet",
  },
  en: {
    "Frugt & Grønt": "Fruit & Vegetables",
    "Kød & Fisk": "Meat & Fish",
    "Brød & Kager": "Bread & Cakes",
    Mejeri: "Dairy",
    Frost: "Frozen",
    Tørvarer: "Dry Goods",
    Drikkevarer: "Beverages",
    "Snacks & Slik": "Snacks & Candy",
    "Personlig Pleje": "Personal Care",
    Husholdning: "Household",
    Andet: "Other",
  },
};

// Category icons mapping
export const categoryIcons = {
  "Frugt & Grønt": "🥬",
  "Kød & Fisk": "🥩",
  "Brød & Kager": "🍞",
  Mejeri: "🥛",
  Frost: "❄️",
  Tørvarer: "📦",
  Drikkevarer: "🥤",
  "Snacks & Slik": "🍭",
  "Personlig Pleje": "🧴",
  Husholdning: "🧽",
  Andet: "❓",
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
  return categoryIcons[categoryKey] || "❓";
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
