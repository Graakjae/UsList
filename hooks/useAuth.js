import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
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
      console.log("Starting Google sign-in...");
      const isExpoGo = Constants.appOwnership === "expo";
      console.log("Is Expo Go:", isExpoGo);

      // Use the correct Expo proxy URI for development
      const redirectUri =
        "https://auth.expo.io/@graakjaer/Camilla-og-Frederiks-app";
      console.log("Redirect URI:", redirectUri);

      const clientId =
        "808301550029-beotgqhmcvutvge3e3nvns19ma0tdb6h.apps.googleusercontent.com";
      console.log("Client ID:", clientId);

      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ["openid", "profile", "email"],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });
      console.log("Auth request created");

      // Debug: Log the authorization URL
      const authUrl = await request.makeAuthUrlAsync({
        authorizationEndpoint: "https://accounts.google.com/oauth/authorize",
      });
      console.log("Authorization URL:", authUrl);

      console.log("Prompting for authorization...");
      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/oauth/authorize",
      });
      console.log("Auth result:", result);

      if (result.type === "success" && result.params.access_token) {
        console.log("Got access token, creating credential...");
        const credential = GoogleAuthProvider.credential(
          null,
          result.params.access_token
        );
        console.log("Signing in with credential...");
        await signInWithCredential(auth, credential);
        console.log("Google sign-in successful!");
      } else {
        console.log("Auth failed or was cancelled:", result);
        throw new Error("Google login blev afbrudt eller mislykkedes");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
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
