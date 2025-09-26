import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function MembersAvatars({ members, maxVisible = 3 }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const { t } = useTranslation();

  // Filter out current user from members
  const otherMembers = members.filter((member) => member.id !== user?.uid);

  if (!otherMembers || otherMembers.length === 0) {
    return null;
  }

  const visibleMembers = otherMembers.slice(0, maxVisible);
  const remainingCount = otherMembers.length - maxVisible;

  const handleAvatarPress = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarsContainer}>
        {visibleMembers.map((member, index) => (
          <TouchableOpacity
            key={member.id}
            style={[
              styles.avatar,
              {
                marginLeft: index > 0 ? -8 : 0,
                zIndex: visibleMembers.length - index,
              },
            ]}
            onPress={() => handleAvatarPress(member)}
            activeOpacity={0.7}
          >
            <Image
              source={
                member.photoURL
                  ? { uri: member.photoURL }
                  : require("../../assets/images/default_user_icon.png")
              }
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        ))}
        {remainingCount > 0 && (
          <View
            style={[
              styles.avatar,
              styles.remainingCount,
              {
                marginLeft: -8,
                zIndex: 0,
              },
            ]}
          >
            <Text style={styles.remainingCountText}>+{remainingCount}</Text>
          </View>
        )}
      </View>

      {/* Member Profile Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedMember && (
              <>
                <Image
                  source={
                    selectedMember.photoURL
                      ? { uri: selectedMember.photoURL }
                      : require("../../assets/images/default_user_icon.png")
                  }
                  style={styles.modalAvatarImage}
                />
                <Text style={styles.modalMemberName}>
                  {selectedMember.displayName}
                  {selectedMember.isOwner && " (" + t("shopping.owner") + ")"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 12,
  },
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  remainingCount: {
    backgroundColor: "#FFC0CB",
  },
  remainingCountText: {
    fontSize: 12,
    fontFamily: "Baloo2-Bold",
    color: "#000",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: 200,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCloseButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  modalMemberName: {
    fontSize: 18,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    textAlign: "center",
  },
});
