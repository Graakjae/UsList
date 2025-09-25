import DeleteButtons from "@/components/shopping/DeleteButtons";
import ItemInput from "@/components/shopping/ItemInput";
import ListHeader from "@/components/shopping/ListHeader";
import ShoppingList from "@/components/shopping/ShoppingList";
import ShoppingModals from "@/components/shopping/ShoppingModals";
import { useAuth } from "@/hooks/useAuth";
import useShoppingList from "@/hooks/useShoppingList";

import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ShoppingScreen() {
  const { user } = useAuth();

  const {
    // State
    newItem,
    searchResults,
    showResults,
    editSearchResults,
    showEditResults,
    lists,
    sharedLists,
    currentListId,
    listsLoading,
    showListDropdown,
    showBottomSheet,
    showEditListModal,
    isCreatingList,
    editListName,
    listMembers,
    showMembersModal,
    showInviteCodeModal,
    editingItemId,
    editingItemName,
    selectedCategory,
    setSelectedCategory,
    quantity,
    setQuantity,
    selectedUnit,
    setSelectedUnit,
    selectedStore,
    setSelectedStore,
    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Functions
    setShowListDropdown,
    setShowBottomSheet,
    setShowEditListModal,
    setIsCreatingList,
    setEditListName,
    setShowMembersModal,
    setShowInviteCodeModal,
    setCurrentListIdWithSave,
    setEditingItemName,

    handleSearch,
    handleEditSearch,
    selectProduct,
    selectEditProduct,
    addItem,
    toggleItem,
    startEditingItem,
    saveEditedItem,
    cancelEditingItem,
    deleteCompletedItems,
    deleteAllItems,
    addNewList,
    handleCreateNewList,
    deleteList,
    saveListName,
    selectSharedList,
    leaveSharedList,
    removeUserFromList,

    openBottomSheet,
    closeBottomSheet,

    getCurrentListName,
    generateInviteLink,
  } = useShoppingList();

  return (
    <View style={styles.container}>
      {listsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC0CB" />
        </View>
      ) : (
        <>
          <ListHeader
            currentListId={currentListId}
            lists={lists}
            sharedLists={sharedLists}
            showListDropdown={showListDropdown}
            setShowListDropdown={setShowListDropdown}
            setCurrentListId={setCurrentListIdWithSave}
            selectSharedList={selectSharedList}
            leaveSharedList={leaveSharedList}
            onCreateNewList={handleCreateNewList}
            getCurrentListName={getCurrentListName}
            openBottomSheet={openBottomSheet}
            listMembers={listMembers}
          />

          <ItemInput
            newItem={newItem}
            handleSearch={handleSearch}
            addItem={addItem}
            showResults={showResults}
            searchResults={searchResults}
            selectProduct={selectProduct}
            currentListId={currentListId}
            isEditing={editingItemId !== null}
          />

          <View style={styles.contentContainer}>
            <ShoppingList
              sortedItems={sortedItems}
              toggleItem={toggleItem}
              currentListId={currentListId}
              onCreateNewList={handleCreateNewList}
              editingItemId={editingItemId}
              editingItemName={editingItemName}
              setEditingItemName={setEditingItemName}
              startEditingItem={startEditingItem}
              saveEditedItem={saveEditedItem}
              cancelEditingItem={cancelEditingItem}
              editSearchResults={editSearchResults}
              showEditResults={showEditResults}
              handleEditSearch={handleEditSearch}
              selectEditProduct={selectEditProduct}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
            />
          </View>

          <DeleteButtons
            hasItems={hasItems}
            hasCompletedItems={hasCompletedItems}
            deleteCompletedItems={deleteCompletedItems}
            deleteAllItems={deleteAllItems}
            currentListId={currentListId}
          />

          <ShoppingModals
            // Modal states
            showBottomSheet={showBottomSheet}
            setShowBottomSheet={setShowBottomSheet}
            showEditListModal={showEditListModal}
            setShowEditListModal={setShowEditListModal}
            isCreatingList={isCreatingList}
            setIsCreatingList={setIsCreatingList}
            showMembersModal={showMembersModal}
            setShowMembersModal={setShowMembersModal}
            showInviteCodeModal={showInviteCodeModal}
            setShowInviteCodeModal={setShowInviteCodeModal}
            // Modal data
            editListName={editListName}
            setEditListName={setEditListName}
            listMembers={listMembers}
            // Functions
            addNewList={addNewList}
            saveListName={saveListName}
            deleteList={deleteList}
            removeUserFromList={removeUserFromList}
            openBottomSheet={openBottomSheet}
            closeBottomSheet={closeBottomSheet}
            // Other props
            currentListId={currentListId}
            getCurrentListName={getCurrentListName}
            user={user}
            lists={lists}
            sharedLists={sharedLists}
            generateInviteLink={generateInviteLink}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
