import {
  faChevronDown,
  faPlus,
  faTrash,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import basketIcon from "../../assets/icons/basket.png";

export default function ListHeader({
  currentListId,
  lists,
  sharedLists,
  showListDropdown,
  setShowListDropdown,
  setCurrentListId,
  deleteList,
  selectSharedList,
  leaveSharedList,
  setShowAddListModal,
  getCurrentListName,
  setShowInviteCodeModal,
  openBottomSheet,
}) {
  const router = useRouter();

  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.listSelector}
          onPress={() => setShowListDropdown(!showListDropdown)}
        >
          <Text style={styles.title}>{getCurrentListName()}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={16} color="#333" />
        </TouchableOpacity>

        {showListDropdown && (
          <View style={styles.dropdownContainer}>
            {/* My Lists */}
            {lists.length > 0 && (
              <>
                <View style={styles.dropdownSectionHeader}>
                  <Text style={styles.dropdownSectionText}>Mine lister</Text>
                </View>
                {lists.map((list) => (
                  <TouchableOpacity
                    key={list.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCurrentListId(list.id);
                      setShowListDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{list.name}</Text>
                    <TouchableOpacity
                      onPress={() => deleteList(list.id)}
                      style={styles.deleteListButton}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        size={14}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Shared Lists */}
            {sharedLists.length > 0 && (
              <>
                <View style={styles.dropdownSectionHeader}>
                  <Text style={styles.dropdownSectionText}>Delte lister</Text>
                </View>
                {sharedLists.map((sharedList) => (
                  <TouchableOpacity
                    key={sharedList.id}
                    style={styles.dropdownItem}
                    onPress={() => selectSharedList(sharedList)}
                  >
                    <View style={styles.sharedListItem}>
                      <Text style={styles.dropdownText}>{sharedList.name}</Text>
                      <Text style={styles.sharedListOwner}>
                        {sharedList.isOwner
                          ? "Du ejer denne liste"
                          : `Ejet af ${sharedList.ownerName}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => leaveSharedList(sharedList)}
                      style={styles.deleteListButton}
                    >
                      <FontAwesomeIcon
                        icon={sharedList.isOwner ? faTrash : faUserTimes}
                        size={14}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.addListButton}
              onPress={() => {
                setShowAddListModal(true);
                setShowListDropdown(false);
              }}
            >
              <FontAwesomeIcon icon={faPlus} size={14} color="#FFC0CB" />
              <Text style={styles.addListText}>Tilføj ny liste</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.headerButtons}>
        <TouchableOpacity
          onPress={() => router.push("/products")}
          style={styles.headerIconButton}
        >
          <Image source={basketIcon} style={styles.headerIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("Test: Opening invite modal directly");
            setShowInviteCodeModal(true);
          }}
          style={styles.headerIconButton}
        >
          <FontAwesomeIcon icon={faUserTimes} size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openBottomSheet}
          style={styles.headerIconButton}
        >
          <FontAwesomeIcon icon={faChevronDown} size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 40,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
  titleContainer: {
    flex: 1,
    position: "relative",
  },
  listSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  deleteListButton: {
    padding: 4,
  },
  addListButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addListText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#FFC0CB",
  },
  dropdownSectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownSectionText: {
    fontSize: 14,
    fontFamily: "Baloo2-Bold",
    color: "#666",
    textTransform: "uppercase",
  },
  sharedListItem: {
    flex: 1,
  },
  sharedListOwner: {
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#666",
    marginTop: 2,
  },
};
