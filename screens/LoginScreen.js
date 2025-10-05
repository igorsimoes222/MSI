import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

const arquivoUsuarios = FileSystem.documentDirectory + 'usuarios.json';

export default function LoginScreen() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!cpf || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      const dadosExistentes = await FileSystem.readAsStringAsync(arquivoUsuarios).catch(() => null);
      const usuarios = dadosExistentes ? JSON.parse(dadosExistentes) : [];
      console.log("Usuários carregados:", usuarios); // Depuração
      const usuario = usuarios.find(u => u.cpf === cpf && u.senha === senha);

      if (usuario) {
        console.log("Usuário encontrado:", usuario); // Depuração
        // Opcional: Salvar o usuário logado (se precisar persistir entre sessões)
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'usuarioLogado.json', JSON.stringify(usuario), { encoding: FileSystem.EncodingType.UTF8 });
        Alert.alert("Sucesso", `Bem-vindo, ${usuario.nome}!`, [
          { text: "OK", onPress: () => router.push("/home") } // Rota corrigida para /home
        ]);
      } else {
        Alert.alert("Erro", "CPF ou senha inválidos.");
      }
    } catch (error) {
      console.log("Erro no login:", error);
      Alert.alert("Erro", "Falha ao ler os usuários ou navegar.");
    }
  };

  return (
    <LinearGradient colors={["#23e900ff", "#00a6d4ff"]} style={styles.container}>
      <View style={styles.box}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
        <TextInput style={styles.input} placeholder="CPF" placeholderTextColor="#ccc" value={cpf} onChangeText={setCpf} keyboardType="numeric"/>
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#ccc" value={senha} onChangeText={setSenha} secureTextEntry/>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/cadastro")}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  box: { width: "85%", padding: 30, backgroundColor: "rgba(0, 0, 0, 0.65)", borderRadius: 25, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 10, elevation: 10, alignItems: "center" },
  logo: { width: 250, height: 250, marginBottom: 20 },
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 15, marginBottom: 15, color: "#fff", borderWidth: 1, borderColor: "#39FF14" },
  button: { width: "100%", backgroundColor: "#39FF14", padding: 15, borderRadius: 15, alignItems: "center", marginBottom: 15, shadowColor: "#39FF14", shadowOpacity: 0.6, shadowRadius: 10, elevation: 5 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  link: { color: "rgba(113, 224, 255, 1)", textAlign: "center", marginTop: 10, fontSize: 14 }
});