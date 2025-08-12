import Modal from "@/components/ui/Modal";
import {
  faEdit,
  faShare,
  faTrash,
  faUsers,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function Modals({
  // Modal states
  showAddListModal,
  setShowAddListModal,
  showBottomSheet,
  showEditListModal,
  setShowEditListModal,
  showMembersModal,
  setShowMembersModal,
  showInviteCodeModal,
  setShowInviteCodeModal,

  // Modal data
  newListName,
  setNewListName,
  editListName,
  setEditListName,
  listMembers,
  inviteCodeInput,
  setInviteCodeInput,

  // Functions
  addNewList,
  saveListName,
  deleteList,
  removeUserFromList,
  handleManualInviteCode,
  openBottomSheet,
  closeBottomSheet,

  // Other props
  currentListId,
  getCurrentListName,
  user,
  lists,
  sharedLists,
  generateInviteLink,
}) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  // Check if current user is owner of the list
  const isOwner = () => {
    if (!user || !currentListId) return false;

    if (currentListId.includes("_")) {
      // Shared list
      const sharedList = sharedLists.find((list) => list.id === currentListId);
      return sharedList && sharedList.ownerId === user.uid;
    } else {
      // User's own list - if it exists in their lists array, they own it
      const list = lists.find((list) => list.id === currentListId);
      return !!list; // If the list exists in user's lists, they own it
    }
  };

  // Handle share list
  const handleShareList = async () => {
    try {
      const inviteLink = generateInviteLink();
      await Share.share({
        message: `Hej! Du er inviteret til at deltage i min indkøbsliste "${getCurrentListName()}". Klik på linket for at tilslutte dig: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Error sharing list:", error);
    }
  };

  // Handle edit list
  const handleEditList = () => {
    setEditListName(getCurrentListName());
    setShowEditListModal(true);
    closeBottomSheet();
  };

  // Handle members
  const handleMembers = () => {
    setShowMembersModal(true);
    closeBottomSheet();
  };

  // Handle delete list
  const handleDeleteList = () => {
    deleteList(currentListId);
    closeBottomSheet();
  };

  return (
    <>
      {/* Add List Modal */}
      <Modal
        visible={showAddListModal}
        onClose={() => {
          setShowAddListModal(false);
          setNewListName("");
        }}
        title="Opret ny liste"
        buttons={[
          {
            text: "Annuller",
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowAddListModal(false);
              setNewListName("");
            },
          },
          {
            text: "Opret",
            style: { backgroundColor: "#FFC0CB" },
            onPress: addNewList,
          },
        ]}
      >
        <TextInput
          style={styles.modalInput}
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Liste navn"
          autoFocus
        />
      </Modal>

      {/* Bottom Sheet */}
      <Modal
        visible={showBottomSheet}
        onClose={closeBottomSheet}
        title={getCurrentListName()}
        buttons={[
          {
            text: t("shopping.close"),
            style: { backgroundColor: "#f0f0f0" },
            onPress: closeBottomSheet,
          },
        ]}
      >
        <View style={styles.bottomSheetContent}>
          {/* For all lists */}
          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleShareList}
          >
            <FontAwesomeIcon icon={faShare} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              {t("shopping.shareList")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleMembers}
          >
            <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              {t("shopping.users")} ({listMembers.length})
            </Text>
          </TouchableOpacity>
          {isOwner() && (
            <>
              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleEditList}
              >
                <FontAwesomeIcon icon={faEdit} size={24} color="#333" />
                <Text style={styles.bottomSheetItemText}>
                  {t("shopping.editListName")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleDeleteList}
              >
                <FontAwesomeIcon icon={faTrash} size={24} color="#F44336" />
                <Text
                  style={[styles.bottomSheetItemText, { color: "#F44336" }]}
                >
                  {t("shopping.deleteList")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Edit List Name Modal */}
      <Modal
        visible={showEditListModal}
        onClose={() => {
          setShowEditListModal(false);
          setEditListName("");
          openBottomSheet();
        }}
        title={
          !currentListId ? t("shopping.createList") : t("shopping.editListName")
        }
        buttons={[
          {
            text: t("shopping.cancel"),
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowEditListModal(false);
              setEditListName("");
              openBottomSheet();
            },
          },
          {
            text: !currentListId ? t("shopping.create") : t("shopping.save"),
            style: { backgroundColor: "#FFC0CB" },
            onPress: saveListName,
          },
        ]}
      >
        <TextInput
          style={styles.modalInput}
          value={editListName}
          onChangeText={setEditListName}
          placeholder={t("shopping.listName")}
          autoFocus={!currentListId}
        />
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          openBottomSheet();
        }}
        title={t("shopping.membersTitle")}
        buttons={[
          {
            text: t("shopping.close"),
            style: { backgroundColor: "#FFC0CB" },
            onPress: () => {
              setShowMembersModal(false);
              openBottomSheet();
            },
          },
        ]}
      >
        {listMembers.length > 0 ? (
          <FlatList
            data={listMembers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Image
                      source={
                        item.photoURL
                          ? { uri: item.photoURL }
                          : require("../../assets/images/icon.png")
                      }
                      style={styles.memberAvatarImage}
                    />
                    <Text style={styles.memberName}>
                      {item.displayName || t("shopping.unknownUser")}
                      {item.isOwner && " (" + t("shopping.owner") + ")"}
                      {item.id === currentUser?.uid &&
                        " (" + t("shopping.you") + ")"}
                    </Text>
                  </View>
                </View>
                {isOwner() && (
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => removeUserFromList(item.id)}
                  >
                    <FontAwesomeIcon
                      icon={faUserTimes}
                      size={16}
                      color="#F44336"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            style={styles.membersList}
          />
        ) : (
          <Text style={styles.noMembersText}>{t("shopping.noMembers")}</Text>
        )}
      </Modal>

      {/* Invite Code Modal */}
      <Modal
        visible={showInviteCodeModal}
        onClose={() => {
          setShowInviteCodeModal(false);
          setInviteCodeInput("");
          openBottomSheet();
        }}
        title={t("shopping.joinList")}
        buttons={[
          {
            text: t("shopping.cancel"),
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowInviteCodeModal(false);
              setInviteCodeInput("");
              openBottomSheet();
            },
          },
          {
            text: t("shopping.join"),
            style: { backgroundColor: "#FFC0CB" },
            onPress: handleManualInviteCode,
          },
        ]}
      >
        <Text style={styles.modalSubtitle}>
          {t("shopping.enterInvitationCode")}
        </Text>
        <TextInput
          style={styles.modalInput}
          value={inviteCodeInput}
          onChangeText={setInviteCodeInput}
          placeholder={t("shopping.enterInvitationCode")}
          autoFocus
          autoCapitalize="none"
        />
      </Modal>
    </>
  );
}

const styles = {
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    marginBottom: 20,
  },
  bottomSheetContent: {
    gap: 15,
  },
  bottomSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  bottomSheetItemText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },

  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  membersList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberInfo: {
    flex: 1,
  },
  memberAvatar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  memberAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  removeMemberButton: {
    padding: 8,
  },
  noMembersText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
};
