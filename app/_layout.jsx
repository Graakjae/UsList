import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../hooks/useAuth";

import {
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import {
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";

import { useColorScheme } from "@/hooks/useColorScheme";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Hvis brugeren ikke er logget ind, redirect til login
        router.replace("/login");
      } else {
        // Hvis brugeren er logget ind, redirect til hovedfanen
        router.replace("/(tabs)");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFC0CB" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {user ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="invite" options={{ headerShown: false }} />
            <Stack.Screen
              name="invite/[inviteCode]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="products" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Baloo 2 fonts
    "Baloo2-Regular": Baloo2_400Regular,
    "Baloo2-Medium": Baloo2_500Medium,
    "Baloo2-SemiBold": Baloo2_600SemiBold,
    "Baloo2-Bold": Baloo2_700Bold,
    "Baloo2-ExtraBold": Baloo2_800ExtraBold,
    // Nunito fonts
    "Nunito-ExtraLight": Nunito_200ExtraLight,
    "Nunito-Light": Nunito_300Light,
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-Medium": Nunito_500Medium,
    "Nunito-SemiBold": Nunito_600SemiBold,
    "Nunito-Bold": Nunito_700Bold,
    "Nunito-ExtraBold": Nunito_800ExtraBold,
    "Nunito-Black": Nunito_900Black,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
