import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "../hooks/useColorScheme";
import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

export default function Layout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!loaded) return;
      const usuarioLogado = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + "usuarioLogado.json"
      ).catch(() => null);
      console.log("Verificando autenticação - usuarioLogado:", usuarioLogado);
      if (!usuarioLogado) {
        router.replace("/login");
      } // Não redireciona se já está logado
    };
    checkAuth();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="sensores" options={{ headerShown: false }} />
        <Stack.Screen name="dados" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}