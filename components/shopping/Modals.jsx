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
import {
  Alert,
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
}) {
  // Generate invite link
  const generateInviteLink = () => {
    return `https://list-invite-app.vercel.app/invite/test/test/123?code=test`;
  };

  // Handle share list
  const handleShareList = () => {
    const inviteLink = generateInviteLink();
    Share.share({
      message: `Hej! Du er inviteret til at deltage i min indkøbsliste "${getCurrentListName()}". Klik på linket for at tilslutte dig: ${inviteLink}`,
      url: inviteLink,
    });
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
    Alert.alert(
      "Slet liste",
      "Er du sikker på, at du vil slette denne liste? Alle varer i listen vil også blive slettet.",
      [
        { text: "Annuller", style: "cancel" },
        { text: "Slet", style: "destructive" },
      ]
    );
  };

  return (
    <>
      {/* Add List Modal */}
      <Modal
        visible={showAddListModal}
        onClose={() => {
          setShowAddListModal(false);
          setNewListName("");
          openBottomSheet();
        }}
        title="Opret ny liste"
        buttons={[
          {
            text: "Annuller",
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowAddListModal(false);
              setNewListName("");
              openBottomSheet();
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
        contentStyle={{ maxHeight: 500 }}
      >
        <View style={styles.bottomSheetContent}>
          {/* For all lists */}
          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleShareList}
          >
            <FontAwesomeIcon icon={faShare} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>Del liste</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleEmailInvitation}
          >
            <FontAwesomeIcon icon={faEnvelope} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>
              Send e-mail invitation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleQRCode}
          >
            <FontAwesomeIcon icon={faQrcode} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>QR-kode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleInviteCode}
          >
            <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
            <Text style={styles.bottomSheetItemText}>Tilslut dig liste</Text>
          </TouchableOpacity>

          {/* Only for user-created lists */}
          {currentListId !== "default" && !currentListId.includes("_") && (
            <>
              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleEditList}
              >
                <FontAwesomeIcon icon={faEdit} size={24} color="#333" />
                <Text style={styles.bottomSheetItemText}>
                  Rediger liste navn
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={handleMembers}
              >
                <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
                <Text style={styles.bottomSheetItemText}>
                  Brugere ({listMembers.length})
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
                  Slet liste
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* For shared lists - only show members */}
          {currentListId !== "default" && currentListId.includes("_") && (
            <TouchableOpacity
              style={styles.bottomSheetItem}
              onPress={handleMembers}
            >
              <FontAwesomeIcon icon={faUsers} size={24} color="#333" />
              <Text style={styles.bottomSheetItemText}>
                Brugere ({listMembers.length})
              </Text>
            </TouchableOpacity>
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
          currentListId === "default" ? "Opret ny liste" : "Rediger liste navn"
        }
        buttons={[
          {
            text: "Annuller",
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowEditListModal(false);
              setEditListName("");
              openBottomSheet();
            },
          },
          {
            text: currentListId === "default" ? "Opret" : "Gem ændringer",
            style: { backgroundColor: "#FFC0CB" },
            onPress: saveListName,
          },
        ]}
      >
        <TextInput
          style={styles.modalInput}
          value={editListName}
          onChangeText={setEditListName}
          placeholder="Liste navn"
          autoFocus={currentListId === "default"}
        />
      </Modal>

      {/* QR Code Modal */}
      {showQRModal && (
        <Animated.View
          style={[styles.qrModalOverlay, { opacity: qrModalOpacity }]}
        >
          <View style={styles.qrModalContent}>
            <Text style={styles.modalTitle}>QR-kode til invitation</Text>
            <Text style={styles.qrModalSubtitle}>
              Del denne QR-kode med andre for at invitere dem til "
              {getCurrentListName()}"
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
                <Text style={styles.qrModalButtonText}>Del</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrModalButton, styles.saveButton]}
                onPress={saveQRCodeToGallery}
              >
                <FontAwesomeIcon icon={faDownload} size={20} color="#fff" />
                <Text style={styles.qrModalButtonText}>Gem</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={closeQRModal}>
              <Text style={styles.closeButtonText}>Luk</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Liste medlemmer"
        buttons={[
          {
            text: "Luk",
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
                    {item.displayName || item.email || "Ukendt bruger"}
                  </Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
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
              </View>
            )}
            style={styles.membersList}
          />
        ) : (
          <Text style={styles.noMembersText}>
            Ingen medlemmer på denne liste endnu
          </Text>
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
        title="Tilslut dig liste"
        buttons={[
          {
            text: "Annuller",
            style: { backgroundColor: "#f0f0f0" },
            onPress: () => {
              setShowInviteCodeModal(false);
              setInviteCodeInput("");
              openBottomSheet();
            },
          },
          {
            text: "Tilslut",
            style: { backgroundColor: "#FFC0CB" },
            onPress: handleManualInviteCode,
          },
        ]}
      >
        <Text style={styles.modalSubtitle}>
          Indtast invitation koden du har modtaget
        </Text>
        <TextInput
          style={styles.modalInput}
          value={inviteCodeInput}
          onChangeText={setInviteCodeInput}
          placeholder="Indtast invitation kode"
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
