// screens/sensorSimulator.js
import { useState, useEffect } from "react";

const sensorTypes = [
  { icon: "lightbulb-o", name: "Luminosidade", unit: "lux", min: 0, max: 1000 },
  { icon: "thermometer", name: "Temperatura", unit: "°C", min: 15, max: 35 },
  { icon: "tint", name: "Umidade/Água", unit: "%", min: 0, max: 100 },
  { icon: "flask", name: "Químico", unit: "", min: 0, max: 14, format: (v) => `pH ${v.toFixed(1)}` },
  { icon: "fire", name: "Fogo", unit: "eventos", min: 0, max: 1 },
  { icon: "bell", name: "Gás", unit: "ppm", min: 0, max: 50 },
];

export const useSensorSimulator = (sensorCount) => {
  const [sensorData, setSensorData] = useState({});

  useEffect(() => {
    // Inicializa os dados com base na quantidade de sensores
    const initialData = {};
    for (let i = 0; i < sensorCount && i < sensorTypes.length; i++) {
      const sensor = sensorTypes[i % sensorTypes.length];
      initialData[sensor.name] = {
        value: sensor.format
          ? sensor.format(Math.random() * (sensor.max - sensor.min) + sensor.min)
          : (Math.random() * (sensor.max - sensor.min) + sensor.min).toFixed(1),
        unit: sensor.unit,
        status: Math.random() > 0.3 ? "Ativo" : "Inativo", // 70% de chance de estar ativo
      };
    }
    setSensorData(initialData);

    // Atualiza os valores a cada 5 segundos
    const interval = setInterval(() => {
      const newData = { ...initialData };
      for (let i = 0; i < sensorCount && i < sensorTypes.length; i++) {
        const sensor = sensorTypes[i % sensorTypes.length];
        newData[sensor.name] = {
          value: sensor.format
            ? sensor.format(Math.random() * (sensor.max - sensor.min) + sensor.min)
            : (Math.random() * (sensor.max - sensor.min) + sensor.min).toFixed(1),
          unit: sensor.unit,
          status: Math.random() > 0.3 ? "Ativo" : "Inativo",
        };
      }
      setSensorData(newData);
    }, 5000);

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, [sensorCount]);

  return sensorData;
};