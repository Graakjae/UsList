import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import {
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      throw error;
    }
  };

  // Google sign-in via Expo AuthSession
  const signInWithGoogle = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "camillaogfrederiksapp",
      });

      const clientId =
        "808301550029-beotgqhmcvutvge3e3nvns19ma0tdb6h.apps.googleusercontent.com";

      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ["openid", "profile", "email"],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/oauth/authorize",
      });

      if (result.type === "success" && result.params.access_token) {
        const credential = GoogleAuthProvider.credential(
          null,
          result.params.access_token
        );
        await signInWithCredential(auth, credential);
      } else {
        throw new Error("Google login blev afbrudt eller mislykkedes");
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAnonymously,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
