import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

const arquivoUsuarios = FileSystem.documentDirectory + 'usuarios.json';

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const router = useRouter();

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1,i)) * (11-i);
    resto = (soma*10) % 11;
    if ((resto===10)||(resto===11)) resto=0;
    if (resto !== parseInt(cpf.substring(9,10))) return false;
    soma=0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1,i))*(12-i);
    resto=(soma*10)%11;
    if ((resto===10)||(resto===11)) resto=0;
    if (resto !== parseInt(cpf.substring(10,11))) return false;
    return true;
  };

  const handleCadastro = async () => {
    if (!nome || !cpf || !senha || !marca || !modelo || !quantidade) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (!validarCPF(cpf)) {
      Alert.alert("Erro", "CPF inválido.");
      return;
    }
    if (isNaN(quantidade) || parseInt(quantidade) <= 0) {
      Alert.alert("Erro", "Quantidade deve ser um número positivo.");
      return;
    }

    const novoUsuario = { nome, cpf, senha, marca, modelo, quantidade: parseInt(quantidade) };

    try {
      const dadosExistentes = await FileSystem.readAsStringAsync(arquivoUsuarios).catch(() => null);
      const usuarios = dadosExistentes ? JSON.parse(dadosExistentes) : [];

      if (usuarios.some(u => u.cpf === cpf)) {
        Alert.alert("Erro", "Este CPF já está cadastrado.");
        return;
      }

      usuarios.push(novoUsuario);
      await FileSystem.writeAsStringAsync(arquivoUsuarios, JSON.stringify(usuarios));
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      setNome(""); setCpf(""); setSenha(""); setMarca(""); setModelo(""); setQuantidade("");
      router.push("/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao salvar o cadastro.");
    }
  };

  return (
    <LinearGradient colors={["#39FF14", "#00C9FF"]} style={styles.container}>
      <View style={styles.box}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain"/>
        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Crie sua conta</Text>

        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#ccc" value={nome} onChangeText={setNome}/>
        <TextInput style={styles.input} placeholder="CPF (11 dígitos)" placeholderTextColor="#ccc" value={cpf} onChangeText={setCpf} keyboardType="numeric" maxLength={11}/>
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#ccc" value={senha} onChangeText={setSenha} secureTextEntry/>
        <TextInput style={styles.input} placeholder="Marca do sensor" placeholderTextColor="#ccc" value={marca} onChangeText={setMarca}/>
        <TextInput style={styles.input} placeholder="Modelo do sensor" placeholderTextColor="#ccc" value={modelo} onChangeText={setModelo}/>
        <TextInput style={styles.input} placeholder="Quantidade" placeholderTextColor="#ccc" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric"/>

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Já tem conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  box: { width: "90%", padding: 30, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 25, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 10, elevation: 10, alignItems: "center" },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#eee", textAlign: "center", marginBottom: 25 },
  input: { width: "100%", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 15, marginBottom: 15, color: "#fff", borderWidth: 1, borderColor: "#39FF14" },
  button: { width: "100%", backgroundColor: "#39FF14", padding: 15, borderRadius: 15, alignItems: "center", marginBottom: 15, shadowColor: "#39FF14", shadowOpacity: 0.6, shadowRadius: 10, elevation: 5 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  link: { color: "#00C9FF", textAlign: "center", marginTop: 10, fontSize: 14 }
});
