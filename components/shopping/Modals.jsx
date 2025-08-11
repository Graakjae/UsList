import Modal from "@/components/ui/Modal";
import {
  faDownload,
  faEdit,
  faEnvelope,
  faQrcode,
  faShare,
  faTrash,
  faUsers,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Linking,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, { withSpring } from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

export default function Modals({
  // Modal states
  showAddListModal,
  setShowAddListModal,
  showBottomSheet,
  setShowBottomSheet,
  showEditListModal,
  setShowEditListModal,
  showQRModal,
  setShowQRModal,
  showMembersModal,
  setShowMembersModal,
  showInviteCodeModal,
  setShowInviteCodeModal,

  // Modal data
  newListName,
  setNewListName,
  editListName,
  setEditListName,
  qrCodeData,
  setQrCodeData,
  listMembers,
  inviteCodeInput,
  setInviteCodeInput,

  // Functions
  addNewList,
  saveListName,
  deleteList,
  closeQRModal,
  saveQRCodeToGallery,
  shareQRCode,
  removeUserFromList,
  handleManualInviteCode,
  openBottomSheet,
  closeBottomSheet,

  // Other props
  currentListId,
  getCurrentListName,
  qrCodeRef,
  qrModalOpacity,
  user,
  lists,
  sharedLists,
  generateInviteLink,
}) {
  const { t } = useTranslation();

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

  // Handle email invitation
  const handleEmailInvitation = () => {
    const inviteLink = generateInviteLink();
    const subject = `Invitation til indkøbsliste: ${getCurrentListName()}`;
    const body = `Hej!\n\nDu er inviteret til at deltage i min indkøbsliste "${getCurrentListName()}".\n\nKlik på dette link for at tilslutte dig: ${inviteLink}\n\nMed venlig hilsen`;

    Linking.openURL(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  // Handle QR code
  const handleQRCode = () => {
    const inviteLink = generateInviteLink();
    setQrCodeData(inviteLink);
    setShowQRModal(true);
    qrModalOpacity.value = withSpring(1, { damping: 15 });
    closeBottomSheet();
  };

  // Handle invite code
  const handleInviteCode = () => {
    setShowInviteCodeModal(true);
    closeBottomSheet();
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
            onPress={handleEmailInvitation}
          >
            <FontAwesomeIcon icon={faEnvelope} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              {t("shopping.sendEmailInvitation")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleQRCode}
          >
            <FontAwesomeIcon icon={faQrcode} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              {t("shopping.qrCode")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleInviteCode}
          >
            <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              {t("shopping.joinList")}
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

      {/* QR Code Modal */}
      {showQRModal && (
        <Animated.View
          style={[styles.qrModalOverlay, { opacity: qrModalOpacity }]}
        >
          <View style={styles.qrModalContent}>
            <Text style={styles.modalTitle}>{t("shopping.qrCodeTitle")}</Text>
            <Text style={styles.qrModalSubtitle}>
              {t("shopping.qrCodeSubtitle")}
            </Text>

            <ViewShot ref={qrCodeRef} style={styles.qrCodeContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrCodeData}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
              </View>
            </ViewShot>

            <View style={styles.qrModalButtons}>
              <TouchableOpacity
                style={[styles.qrModalButton, styles.shareButton]}
                onPress={shareQRCode}
              >
                <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
                <Text style={styles.qrModalButtonText}>
                  {t("shopping.share")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrModalButton, styles.saveButton]}
                onPress={saveQRCodeToGallery}
              >
                <FontAwesomeIcon icon={faDownload} size={20} color="#fff" />
                <Text style={styles.qrModalButtonText}>
                  {t("shopping.save")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeQRModal}>
              <Text style={styles.closeButtonText}>{t("shopping.close")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={t("shopping.membersTitle")}
        buttons={[
          {
            text: t("shopping.close"),
            style: { backgroundColor: "#FFC0CB" },
            onPress: () => setShowMembersModal(false),
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
                  <Text style={styles.memberName}>
                    {item.displayName ||
                      item.email ||
                      t("shopping.unknownUser")}
                  </Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
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
  qrModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  qrModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  qrModalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  qrModalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  shareButton: {
    backgroundColor: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#FFC0CB",
  },
  qrModalButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#fff",
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
  memberName: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  memberEmail: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#666",
    marginTop: 2,
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
