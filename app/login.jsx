import Input from "@/components/ui/Input";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    signInWithEmail,
    signInWithGoogle,
    signInAnonymously,
    user,
    loading,
  } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleEmailLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      Alert.alert(t("auth.loginError"), error.message || t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        t("auth.googleLoginError"),
        error.message || t("auth.googleLoginFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.welcome")}</Text>
          <Text style={styles.appName}>{t("auth.appName")}</Text>
          <Text style={styles.subtitle}>{t("auth.loginSubtitle")}</Text>
        </View>

        <View style={styles.formSection}>
          <Input
            placeholder={t("auth.email")}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <Input
            placeholder={t("auth.password")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleEmailLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.loginButtonText}>{t("auth.login")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/signup")}
            disabled={isSubmitting}
          >
            <Text style={styles.linkButtonText}>{t("auth.signup")}</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>eller</Text>
          <View style={styles.divider} />
        </View> */}

        {/* <View style={styles.altLoginSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faGoogle} size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Log ind med Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.anonymousButton}
            onPress={handleAnonymousSignIn}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faUser} size={20} color="#FFC0CB" />
            <Text style={styles.anonymousButtonText}>Fortsæt som gæst</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 300,
    paddingTop: 120,
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    color: "#333",
    marginBottom: 8,
    fontFamily: "Baloo2-Bold",
  },
  appName: {
    fontSize: 32,
    color: "#FFC0CB",
    marginBottom: 16,
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

  loginButton: {
    backgroundColor: "#FFC0CB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  loginButtonText: {
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 14,
    fontFamily: "Nunito-Regular",
  },
  altLoginSection: {
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 220,
    justifyContent: "center",
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
    fontFamily: "Baloo2-Bold",
  },
  anonymousButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FFC0CB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 220,
    justifyContent: "center",
  },
  anonymousButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#FFC0CB",
    fontFamily: "Baloo2-Bold",
  },
});
