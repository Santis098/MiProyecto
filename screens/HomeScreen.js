import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [totalSavings, setTotalSavings] = useState(0);
  const [dineroAhorrado, setDineroAhorrado] = useState(0);
  const [currency, setCurrency] = useState('COP');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('user_name');
        const savedMetaAhorro = await AsyncStorage.getItem('meta_ahorro');
        const savedDineroAhorrado = await AsyncStorage.getItem('dinero_ahorrado');
        const savedCurrency = await AsyncStorage.getItem('tipo_moneda');

        if (savedCurrency) setCurrency(savedCurrency);
        if (savedName) setUserName(savedName);

        setTotalSavings(parseFloat(savedMetaAhorro) || 0);
        setDineroAhorrado(parseFloat(savedDineroAhorrado) || 0);
      } catch (error) {
        console.error('❌ Error cargando los datos del usuario:', error);
      }
    };

    loadUserData(); // Carga inicial

    // Actualiza los valores cada 1 segundo
    const interval = setInterval(loadUserData, 1000);

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {userName}</Text>
      <Text style={styles.subtitle}>Tu meta actual es:</Text>
      <Text style={styles.savings}>
        {currency} {totalSavings.toLocaleString('es-CO')}
      </Text>
      <Text style={styles.subtitle}>Tu dinero ahorrado es:</Text>
      <Text style={styles.savings}>
        {currency} {dineroAhorrado.toLocaleString('es-CO')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
  },
  savings: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 15,
  },
});
