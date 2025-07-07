import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !repeatPassword) {
      Alert.alert("Fejl", "Udfyld alle felter");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Fejl", "Kodeordene matcher ikke");
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Oprettelse fejlede",
        error.message || "Kunne ikke oprette bruger"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Opret konto</Text>
          <Text style={styles.subtitle}>Få adgang til alle funktioner</Text>
        </View>
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Kodeord"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Gentag kodeord"
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={isSubmitting || !email || !password || !repeatPassword}
          >
            <Text style={styles.signupButtonText}>Opret konto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace("/login")}
            disabled={isSubmitting}
          >
            <Text style={styles.linkButtonText}>Tilbage til login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  signupButton: {
    backgroundColor: "#FFC0CB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    alignItems: "center",
    marginBottom: 8,
  },
  linkButtonText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
