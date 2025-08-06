import DeleteButtons from "@/components/shopping/DeleteButtons";
import ItemInput from "@/components/shopping/ItemInput";
import ListHeader from "@/components/shopping/ListHeader";
import Modals from "@/components/shopping/Modals";
import ShoppingList from "@/components/shopping/ShoppingList";
import { useAuth } from "@/hooks/useAuth";
import useShoppingList from "@/hooks/useShoppingList";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
    // State
    items,
    newItem,
    searchResults,
    showResults,
    products,
    lists,
    sharedLists,
    currentListId,
    listsLoading,
    showListDropdown,
    showAddListModal,
    newListName,
    showBottomSheet,
    showEditListModal,
    editListName,
    listMembers,
    showQRModal,
    qrCodeData,
    showMembersModal,
    showInviteCodeModal,
    inviteCodeInput,

    // Computed values
    sortedItems,
    hasCompletedItems,
    hasItems,

    // Refs and animations
    qrCodeRef,
    qrModalOpacity,

    // Functions
    setNewItem,
    setShowResults,
    setCurrentListId,
    setShowListDropdown,
    setShowAddListModal,
    setNewListName,
    setShowBottomSheet,
    setShowEditListModal,
    setEditListName,
    setShowQRModal,
    setQrCodeData,
    setShowMembersModal,
    setShowInviteCodeModal,
    setInviteCodeInput,
    setCurrentListIdWithSave,

    handleSearch,
    selectProduct,
    addItem,
    toggleItem,
    deleteCompletedItems,
    deleteAllItems,
    addNewList,
    deleteList,
    saveListName,
    selectSharedList,
    leaveSharedList,
    removeUserFromList,
    handleManualInviteCode,

    shareList,
    sendEmailInvitation,
    showQRCode,
    closeQRModal,
    saveQRCodeToGallery,
    shareQRCode,

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
            deleteList={deleteList}
            selectSharedList={selectSharedList}
            leaveSharedList={leaveSharedList}
            setShowAddListModal={setShowAddListModal}
            getCurrentListName={getCurrentListName}
            setShowInviteCodeModal={setShowInviteCodeModal}
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

          <ShoppingList
            sortedItems={sortedItems}
            toggleItem={toggleItem}
            currentListId={currentListId}
            setShowAddListModal={setShowAddListModal}
          />

          <DeleteButtons
            hasItems={hasItems}
            hasCompletedItems={hasCompletedItems}
            deleteCompletedItems={deleteCompletedItems}
            deleteAllItems={deleteAllItems}
            currentListId={currentListId}
          />

          <Modals
            // Modal states
            showAddListModal={showAddListModal}
            setShowAddListModal={setShowAddListModal}
            showBottomSheet={showBottomSheet}
            setShowBottomSheet={setShowBottomSheet}
            showEditListModal={showEditListModal}
            setShowEditListModal={setShowEditListModal}
            showQRModal={showQRModal}
            setShowQRModal={setShowQRModal}
            showMembersModal={showMembersModal}
            setShowMembersModal={setShowMembersModal}
            showInviteCodeModal={showInviteCodeModal}
            setShowInviteCodeModal={setShowInviteCodeModal}
            // Modal data
            newListName={newListName}
            setNewListName={setNewListName}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
