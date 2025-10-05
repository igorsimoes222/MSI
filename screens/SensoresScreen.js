import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useSensorSimulator } from "../screens/sensorSimulator";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function SensoresScreen() {
  const router = useRouter();
  const [userSensors, setUserSensors] = useState(0);
  const sensorData = useSensorSimulator(userSensors);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const alertColorValue = useSharedValue(0); // 0: verde, 0.5: amarelo, 1: vermelho

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usuarioLogado = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "usuarioLogado.json"
        ).catch(() => null);
        if (usuarioLogado) {
          const user = JSON.parse(usuarioLogado);
          setUserSensors(user.quantidade || 0);
        }
      } catch (error) {
        console.log("Erro ao carregar usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSensorPress = (sensorName) => {
    setSelectedSensor(sensorName);
    updateAlertColor(sensorName);
  };

  const closeModal = () => {
    setSelectedSensor(null);
    alertColorValue.value = 0; // Reseta para verde ao fechar
  };

  // Atualiza a cor do anel com base no valor normalizado do sensor
  const updateAlertColor = (sensorName) => {
    const sensor = sensorTypes.find((s) => s.name === sensorName);
    if (sensor) {
      const value = sensorData[sensorName]?.value;
      const numValue = parseFloat(value) || sensor.min;
      const normalizedValue = (numValue - sensor.min) / (sensor.max - sensor.min);
      if (normalizedValue >= 0.8) alertColorValue.value = withTiming(1, { duration: 500, easing: Easing.ease }); // Vermelho (>80%)
      else if (normalizedValue >= 0.5) alertColorValue.value = withTiming(0.5, { duration: 500, easing: Easing.ease }); // Amarelo (>50%)
      else alertColorValue.value = withTiming(0, { duration: 500, easing: Easing.ease }); // Verde (≤50%)
    }
  };

  // Atualiza a cor dinamicamente a cada mudança no sensorData
  useEffect(() => {
    if (selectedSensor) {
      const interval = setInterval(() => {
        updateAlertColor(selectedSensor);
      }, 1000); // Verifica a cada segundo
      return () => clearInterval(interval);
    }
  }, [selectedSensor, sensorData]);

  // Animação do pulso
  const pulse = useSharedValue(1);
  useEffect(() => {
    const pulseAnimation = () => {
      pulse.value = withTiming(1.5, {
        duration: 1000,
        easing: Easing.ease,
      }, () => {
        pulse.value = withTiming(1, {
          duration: 1000,
          easing: Easing.ease,
        }, pulseAnimation);
      });
    };
    if (selectedSensor) pulseAnimation();
    return () => pulse.value = 1;
  }, [selectedSensor]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  // Estilo animado para a cor do anel
  const alertRingStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      alertColorValue.value,
      [0, 0.5, 1],
      ["green", "yellow", "red"]
    );
    return {
      borderColor: backgroundColor,
    };
  });

  const sensorIcons = {
    Luminosidade: "lightbulb-o",
    Temperatura: "thermometer",
    "Umidade/Água": "tint",
    Químico: "flask",
    Fogo: "fire",
    Gás: "bell",
  };

  const sensorTypes = [
    { icon: "lightbulb-o", name: "Luminosidade", min: 0, max: 1000 },
    { icon: "thermometer", name: "Temperatura", min: 15, max: 35 },
    { icon: "tint", name: "Umidade/Água", min: 0, max: 100 },
    { icon: "flask", name: "Químico", min: 0, max: 14 },
    { icon: "fire", name: "Fogo", min: 0, max: 1 },
    { icon: "bell", name: "Gás", min: 0, max: 50 },
  ];

  const displayedSensors = [];
  for (let i = 0; i < userSensors && i < sensorTypes.length; i++) {
    displayedSensors.push(sensorTypes[i % sensorTypes.length]);
  }

  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={styles.topBar} />

      {/* Área Principal com Gradiente */}
      <LinearGradient
        colors={["#00a6d4ff", "#23e900ff"]}
        style={styles.mainArea}
      >
        {/* Título */}
        <Text style={styles.title}>Sensores</Text>

        {/* Grade de Ícones */}
        <View style={styles.gridContainer}>
          {displayedSensors.map((sensor, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButton}
              onPress={() => handleSensorPress(sensor.name)}
            >
              <FontAwesome name={sensor.icon} size={40} color="#000000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Área para Dados ou Detalhes */}
        <View style={styles.detailsArea}>
          <Text style={styles.detailsText}>
            {userSensors > 0
              ? `Sensores ativos: ${userSensors} (atualiza a cada 5s)`
              : "Nenhum sensor ativo."}
          </Text>
        </View>
      </LinearGradient>

      {/* Barra Inferior */}
      <View style={styles.bottomBar} />

      {/* Modal de Detalhes do Sensor */}
      <Modal
        transparent={true}
        visible={selectedSensor !== null}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sensorContainer}>
              <Animated.View style={[styles.alertRing, alertRingStyle]} />
              <FontAwesome
                name={sensorIcons[selectedSensor] || "question"}
                size={60}
                color="#000000"
                style={styles.sensorIcon}
              />
            </View>
            <Animated.View style={[styles.pulseDot, pulseStyle]}>
              <FontAwesome name="circle" size={20} color="#000000" />
            </Animated.View>
            <Text style={styles.modalText}>
              {selectedSensor}: {sensorData[selectedSensor]?.value}{" "}
              {sensorData[selectedSensor]?.unit} (Status: {sensorData[selectedSensor]?.status})
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginVertical: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
  },
  iconButton: {
    width: 120,
    height: 120,
    backgroundColor: "#87CEEB",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  detailsArea: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    alignItems: "center",
  },
  detailsText: {
    fontSize: 16,
    color: "#000000",
  },
  bottomBar: {
    height: 50,
    backgroundColor: "#747474",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  sensorContainer: {
    position: "relative",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  alertRing: {
    flex: "center",
    alignContent:"center",
    textAlign: "center",
    position: "absolute",
    width: 120,
    height: 120,
    borderWidth: 10,
    borderRadius: 100,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: "auto",
    borderColor: "transparent", // Cor será animada
    
  },
  sensorIcon: {
    
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -20 }], // Centraliza o ícone de 60px
  },
  pulseDot: {
    marginTop: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#747474",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});