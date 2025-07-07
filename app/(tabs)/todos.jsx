import { onValue, push, ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { database } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    try {
      const todosRef = ref(database, `users/${user.uid}/todos`);

      onValue(
        todosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const todosArray = Object.entries(data).map(([id, todo]) => ({
              id,
              ...todo,
            }));
            setTodos(todosArray);
          } else {
            setTodos([]);
          }
        },
        (error) => {
          console.error("Firebase listener error:", error);
        }
      );
    } catch (error) {
      console.error("Error setting up Firebase listener:", error);
    }
  }, [user]);

  const addTodo = () => {
    if (!user) return;

    if (newTodo.trim()) {
      try {
        const todosRef = ref(database, `users/${user.uid}/todos`);
        const newTodoRef = push(todosRef);
        set(newTodoRef, {
          title: newTodo,
          completed: false,
          createdAt: Date.now(),
        })
          .then(() => {
            setNewTodo("");
          })
          .catch((error) => {
            console.error("Error adding todo:", error);
            Alert.alert("Fejl", "Kunne ikke tilføje opgave");
          });
      } catch (error) {
        console.error("Error in addTodo:", error);
      }
    }
  };

  const toggleTodo = (id) => {
    if (!user) return;

    const todoRef = ref(database, `users/${user.uid}/todos/${id}`);
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      update(todoRef, {
        completed: !todo.completed,
      });
    }
  };

  const deleteTodo = (id) => {
    if (!user) return;

    Alert.alert(
      "Slet opgave",
      "Er du sikker på, at du vil slette denne opgave?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet",
          style: "destructive",
          onPress: () => {
            const todoRef = ref(database, `users/${user.uid}/todos/${id}`);
            remove(todoRef);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo Liste</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Tilføj en opgave..."
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity
              style={styles.todoContent}
              onPress={() => toggleTodo(item.id)}
            >
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTodo(item.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontFamily: "Baloo2-Bold",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Baloo2-Bold",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
    fontFamily: "Nunito-Regular",
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 24,
    color: "#ff3b30",
    fontFamily: "Baloo2-Bold",
  },
});
