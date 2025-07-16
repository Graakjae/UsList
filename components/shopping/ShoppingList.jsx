import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function ShoppingList({ sortedItems, toggleItem }) {
  // console.log(sortedItems);
  // const { user } = useAuth();
  // console.log("user", user);
  return (
    <FlatList
      data={sortedItems}
      style={styles.listContainer}
      keyExtractor={(item) => `item_${item.id}_${item.name}`}
      renderItem={({ item }) => (
        <View style={styles.noteLine}>
          <View style={styles.holeMargin}>
            <View style={styles.hole} />
          </View>

          <TouchableOpacity
            style={styles.item}
            onPress={() => toggleItem(item.id)}
          >
            <Text
              style={[
                styles.itemText,
                {
                  color: item.color || "#333",
                  fontFamily: item.font || "Baloo2-Bold",
                },
                item.completed && styles.completedText,
              ]}
            >
              {item.name}
            </Text>
            {item.icon_url && (
              <Image
                source={
                  item.icon_url.startsWith("data:")
                    ? { uri: item.icon_url }
                    : {
                        uri: `data:image/png;base64,${
                          item.icon_url.split(",")[1]
                        }`,
                      }
                }
                style={styles.productImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = {
  listContainer: {
    flex: 1,
    backgroundColor: "#fff89d",
    marginBottom: 60,
  },
  noteLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff89d",
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e1d96b",
  },
  holeMargin: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  hole: {
    width: 15,
    height: 15,
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "red",
    fontFamily: "Nunito-Bold",
  },
  productImage: {
    width: 25,
    height: 25,
    padding: 2,
    zIndex: 1000,
  },
};
