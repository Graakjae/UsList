import DeleteButtons from "@/components/shopping/DeleteButtons";
import ItemInput from "@/components/shopping/ItemInput";
import ListHeader from "@/components/shopping/ListHeader";
import Modals from "@/components/shopping/Modals";
import ShoppingList from "@/components/shopping/ShoppingList";
import { useAuth } from "@/hooks/useAuth";
import useShoppingList from "@/hooks/useShoppingList";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";

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
    showQRModal,
    qrCodeData,
    showMembersModal,
    showInviteCodeModal,
    inviteCodeInput,
    editingItemId,
    editingItemName,

    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Refs and animations
    qrCodeRef,
    qrModalOpacity,

    // Functions
    setShowListDropdown,
    setShowBottomSheet,
    setShowEditListModal,
    setIsCreatingList,
    setEditListName,
    setShowQRModal,
    setQrCodeData,
    setShowMembersModal,
    setShowInviteCodeModal,
    setInviteCodeInput,
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
    handleManualInviteCode,

    closeQRModal,
    saveQRCodeToGallery,
    shareQRCode,

    openBottomSheet,
    closeBottomSheet,

    getCurrentListName,
    generateInviteLink,
  } = useShoppingList();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
            />
          </View>

          <DeleteButtons
            hasItems={hasItems}
            hasCompletedItems={hasCompletedItems}
            deleteCompletedItems={deleteCompletedItems}
            deleteAllItems={deleteAllItems}
            currentListId={currentListId}
          />

          <Modals
            // Modal states
            showBottomSheet={showBottomSheet}
            setShowBottomSheet={setShowBottomSheet}
            showEditListModal={showEditListModal}
            setShowEditListModal={setShowEditListModal}
            isCreatingList={isCreatingList}
            setIsCreatingList={setIsCreatingList}
            showQRModal={showQRModal}
            setShowQRModal={setShowQRModal}
            showMembersModal={showMembersModal}
            setShowMembersModal={setShowMembersModal}
            showInviteCodeModal={showInviteCodeModal}
            setShowInviteCodeModal={setShowInviteCodeModal}
            // Modal data
            editListName={editListName}
            setEditListName={setEditListName}
            qrCodeData={qrCodeData}
            setQrCodeData={setQrCodeData}
            listMembers={listMembers}
            inviteCodeInput={inviteCodeInput}
            setInviteCodeInput={setInviteCodeInput}
            // Functions
            addNewList={addNewList}
            saveListName={saveListName}
            deleteList={deleteList}
            closeQRModal={closeQRModal}
            saveQRCodeToGallery={saveQRCodeToGallery}
            shareQRCode={shareQRCode}
            removeUserFromList={removeUserFromList}
            handleManualInviteCode={handleManualInviteCode}
            openBottomSheet={openBottomSheet}
            closeBottomSheet={closeBottomSheet}
            // Other props
            currentListId={currentListId}
            getCurrentListName={getCurrentListName}
            qrCodeRef={qrCodeRef}
            qrModalOpacity={qrModalOpacity}
            user={user}
            lists={lists}
            sharedLists={sharedLists}
            generateInviteLink={generateInviteLink}
          />
        </>
      )}
    </KeyboardAvoidingView>
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
