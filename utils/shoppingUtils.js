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

// Sort items by category - now handles translated categories
export const sortItemsByCategory = (items, language = "da") => {
  return [...items].sort((a, b) => {
    // Get category key from translated category name
    const categoryKeyA = getCategoryKeyFromLabel(a.category, language);
    const categoryKeyB = getCategoryKeyFromLabel(b.category, language);

    const categoryA = categoryOrder[categoryKeyA] || 999;
    const categoryB = categoryOrder[categoryKeyB] || 999;
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
  } else if (currentListId.includes("_")) {
    const [ownerId, listId] = currentListId.split("_");
    return `users/${ownerId}/shoppingItems/${listId}`;
  } else {
    return `users/${user.uid}/shoppingItems/${currentListId}`;
  }
};

// Get item path based on list type
export const getItemPath = (user, currentListId, itemId) => {
  if (!currentListId) {
    return null; // No list selected
  } else if (currentListId.includes("_")) {
    const [ownerId, listId] = currentListId.split("_");
    return `users/${ownerId}/shoppingItems/${listId}/${itemId}`;
  } else {
    return `users/${user.uid}/shoppingItems/${currentListId}/${itemId}`;
  }
};

// Check if item is completed
export const isItemCompleted = (items) => {
  return items.some((item) => item.completed);
};

// Check if list has items
export const hasItems = (items) => {
  return items.length > 0;
};
