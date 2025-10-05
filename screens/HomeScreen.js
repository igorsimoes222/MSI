import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as FileSystem from 'expo-file-system';

// Ícone simples de usuário (usando uma imagem local ou placeholder)
const UserIcon = require("../assets/images/user.png");

export default function HomeScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("Usuário");

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const usuarioJSON = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'usuarioLogado.json').catch(() => null);
        if (usuarioJSON) {
          const usuario = JSON.parse(usuarioJSON);
          setNome(usuario.nome || "Usuário");
          console.log("Nome carregado:", usuario.nome);
        }
      } catch (error) {
        console.log("Erro ao carregar usuário:", error);
        setNome("Usuário");
      }
    };
    fetchUsuario();
  }, []);

  const handleLogout = async () => {
    try {
      await FileSystem.deleteAsync(FileSystem.documentDirectory + 'usuarioLogado.json', { idempotent: true });
      router.replace("/login");
    } catch (error) {
      console.log("Erro no logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />
      <LinearGradient colors={["#00a6d4ff", "#23e900ff"]} style={styles.mainArea}>
        <Image source={UserIcon} style={styles.userIcon} resizeMode="contain" />
        <Text style={styles.welcomeText}>Bem-vindo, {nome}!</Text>
        <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {
  console.log("Navegando para /sensores");
  router.push("/sensores");
}}>
  <Text style={styles.buttonText}>SENSORES</Text>
</TouchableOpacity>
          <TouchableOpacity
  style={styles.button}
  onPress={() => {
    console.log("Navegando para /dados");
    router.push("/dados");
  }}
>
  <Text style={styles.buttonText}>HISTORICO</Text>
</TouchableOpacity>
          <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>ALERTAS</Text></TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.bottomBar} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 50,
    backgroundColor: "#747474",
  },
  mainArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  userIcon: {
    width: 130,
    height: 130,
    marginTop: 20, // Pequeno espaçamento abaixo da barra cinza
    marginBottom: 20, // Espaçamento antes do texto
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 40, // Espaçamento antes dos botões
  },
  buttonsContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "80%",
    height: 80,
    backgroundColor: "#87CEEB", // Azul-claro
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  bottomBar: {
    height: 50,
    backgroundColor: "#747474",
  },
});