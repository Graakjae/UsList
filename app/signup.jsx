import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !repeatPassword) {
      Alert.alert(t("common.error"), t("auth.fillAllFields"));
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert(t("common.error"), t("auth.passwordsDontMatch"));
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, name);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        t("auth.signupError"),
        error.message || t("auth.signupFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.createAccount")}</Text>
          <Text style={styles.subtitle}>{t("auth.signupSubtitle")}</Text>
        </View>
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.name")}
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.confirmPassword")}
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={isSubmitting}
          >
            <Text style={styles.signupButtonText}>
              {t("auth.createAccount")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace("/login")}
            disabled={isSubmitting}
          >
            <Text style={styles.linkButtonText}>{t("auth.backToLogin")}</Text>
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
    color: "#333",
    marginBottom: 8,
    fontFamily: "Baloo2-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
    fontFamily: "Nunito-Regular",
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
    fontFamily: "Nunito-Regular",
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
    fontFamily: "Baloo2-Bold",
  },
  linkButton: {
    alignItems: "center",
    marginBottom: 8,
  },
  linkButtonText: {
    color: "#007AFF",
    fontSize: 15,
    fontFamily: "Nunito-Regular",
  },
});
