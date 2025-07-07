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

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    try {
      const notesRef = ref(database, `users/${user.uid}/notes`);

      onValue(
        notesRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const notesArray = Object.entries(data).map(([id, note]) => ({
              id,
              ...note,
            }));
            setNotes(notesArray);
          } else {
            setNotes([]);
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

  const addNote = () => {
    if (!user) return;

    if (newNote.trim()) {
      try {
        const notesRef = ref(database, `users/${user.uid}/notes`);
        const newNoteRef = push(notesRef);
        set(newNoteRef, {
          content: newNote,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
          .then(() => {
            setNewNote("");
          })
          .catch((error) => {
            console.error("Error adding note:", error);
            Alert.alert("Fejl", "Kunne ikke tilføje note");
          });
      } catch (error) {
        console.error("Error in addNote:", error);
      }
    }
  };

  const updateNote = (id, content) => {
    if (!user) return;

    try {
      const noteRef = ref(database, `users/${user.uid}/notes/${id}`);
      update(noteRef, {
        content,
        updatedAt: Date.now(),
      });
      setEditingNote(null);
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Fejl", "Kunne ikke opdatere note");
    }
  };

  const deleteNote = (id) => {
    if (!user) return;

    Alert.alert("Slet note", "Er du sikker på, at du vil slette denne note?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: () => {
          const noteRef = ref(database, `users/${user.uid}/notes/${id}`);
          remove(noteRef);
        },
      },
    ]);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("da-DK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderNote = ({ item }) => {
    if (editingNote === item.id) {
      return (
        <View style={styles.noteItem}>
          <TextInput
            style={styles.editInput}
            value={item.content}
            onChangeText={(text) => {
              const updatedNotes = notes.map((note) =>
                note.id === item.id ? { ...note, content: text } : note
              );
              setNotes(updatedNotes);
            }}
            multiline
            autoFocus
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => updateNote(item.id, item.content)}
            >
              <Text style={styles.saveButtonText}>Gem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingNote(null)}
            >
              <Text style={styles.cancelButtonText}>Annuller</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.noteItem}>
        <TouchableOpacity
          style={styles.noteContent}
          onPress={() => setEditingNote(item.id)}
        >
          <Text style={styles.noteText}>{item.content}</Text>
          <Text style={styles.noteDate}>
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Noter</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Skriv en note..."
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        style={styles.notesList}
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
    alignItems: "flex-start",
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#FFC0CB",
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
  notesList: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC0CB",
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
    lineHeight: 24,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#666",
  },
  editInput: {
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Nunito-Medium",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#fff",
    fontFamily: "Nunito-Medium",
    fontSize: 14,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#ff3b30",
    fontFamily: "Baloo2-Bold",
  },
});
