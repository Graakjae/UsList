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
};

// Sort items by category
export const sortItemsByCategory = (items) => {
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
  if (currentListId === "default") {
    return `users/${user.uid}/shoppingItems/${currentListId}`;
  } else if (currentListId.includes("_")) {
    const [ownerId, listId] = currentListId.split("_");
    return `users/${ownerId}/shoppingItems/${listId}`;
  } else {
    return `users/${user.uid}/shoppingItems/${currentListId}`;
  }
};

// Get item path based on list type
export const getItemPath = (user, currentListId, itemId) => {
  if (currentListId === "default") {
    return `users/${user.uid}/shoppingItems/${currentListId}/${itemId}`;
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
