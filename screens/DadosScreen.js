import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useSensorSimulator } from "../screens/sensorSimulator";

export default function DadosScreen() {
  console.log("DadosScreen carregado");
  const router = useRouter();
  const [selectedSensor, setSelectedSensor] = useState("Selecione um sensor");
  const [sensorOptions, setSensorOptions] = useState([]);
  const [userSensors, setUserSensors] = useState(0);
  const sensorData = useSensorSimulator(userSensors);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usuarioLogado = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "usuarioLogado.json"
        ).catch(() => null);
        if (usuarioLogado) {
          const user = JSON.parse(usuarioLogado);
          setUserSensors(user.quantidade || 0);

          // Gera opções de sensores com base na quantidade do usuário
          const sensors = [];
          const sensorNames = [
            "Luminosidade",
            "Temperatura",
            "Umidade/Água",
            "Químico",
            "Fogo",
            "Gás",
          ];
          for (let i = 0; i < user.quantidade && i < sensorNames.length; i++) {
            sensors.push({ label: `${sensorNames[i]} (Sensor ${i + 1})`, value: sensorNames[i] });
          }
          setSensorOptions(
            sensors.length > 0
              ? sensors
              : [{ label: "Nenhum sensor", value: "Nenhum sensor" }]
          );
          // Define o primeiro sensor como padrão, se houver
          if (sensors.length > 0) {
            setSelectedSensor(sensors[0].value);
          }
        }
      } catch (error) {
        console.log("Erro ao carregar usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSensorSelect = (itemValue) => {
    setSelectedSensor(itemValue);
  };

  const historicData =
    selectedSensor !== "Selecione um sensor" &&
    selectedSensor !== "Nenhum sensor"
      ? [
          {
            nome: `${selectedSensor.toLowerCase()}`,
            alerta: sensorData[selectedSensor]?.value
              ? parseFloat(sensorData[selectedSensor].value) > 50
                ? 1.0
                : 0.5
              : 0.8, // Alerta baseado no valor (ex.: >50 = 100%, <50 = 50%)
          },
        ]
      : [];

  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={styles.topBar} />

      {/* Área Principal com Gradiente */}
      <LinearGradient
        colors={["#00a6d4ff", "#23e900ff"]}
        style={styles.mainArea}
      >
        {/* Dropdown de Seleção */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedSensor}
            onValueChange={handleSensorSelect}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            enabled={sensorOptions.length > 1} // Desativa se só houver "Nenhum sensor"
          >
            <Picker.Item
              label="Selecione um sensor"
              value="Selecione um sensor"
            />
            {sensorOptions.map((sensor, index) => (
              <Picker.Item
                key={index}
                label={sensor.label}
                value={sensor.value}
              />
            ))}
          </Picker>
        </View>

        {/* Título da Seção */}
        <Text style={styles.sectionTitle}>Historico:</Text>

        {/* Tabela de Histórico */}
        <ScrollView style={styles.tableContainer}>
          {historicData.length > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Nome sensor</Text>
                <Text style={styles.headerText}>Alerta</Text>
              </View>
              {historicData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.cellText}>{item.nome}</Text>
                  <View style={styles.progressContainer}>
                    <View
                      style={[styles.progressBar, { width: `${item.alerta * 100}%` }]}
                    />
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.noDataText}>Nenhum histórico disponível.</Text>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Barra Inferior */}
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
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    fontSize: 16,
    height: 50,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cellText: {
    flex: 1,
    textAlign: "center",
    color: "#000000",
  },
  progressContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00FF00", // Verde
  },
  bottomBar: {
    height: 50,
    backgroundColor: "#747474",
  },
  noDataText: {
    textAlign: "center",
    color: "#000000",
    fontSize: 16,
    marginTop: 20,
  },
});