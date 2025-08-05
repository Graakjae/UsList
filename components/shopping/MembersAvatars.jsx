import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function MembersAvatars({ members, maxVisible = 3 }) {
  if (!members || members.length === 0) {
    return null;
  }

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <View style={styles.container}>
      <View style={styles.avatarsContainer}>
        {visibleMembers.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.avatar,
              {
                marginLeft: index > 0 ? -8 : 0,
                zIndex: visibleMembers.length - index,
              },
            ]}
          >
            <Image
              source={
                member.photoURL
                  ? { uri: member.photoURL }
                  : require("../../assets/images/icon.png")
              }
              style={styles.avatarImage}
            />
          </View>
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
    borderWidth: 2,
    borderColor: "#fff",
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
    color: "#fff",
  },
});
