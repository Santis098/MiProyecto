import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [totalSavings, setTotalSavings] = useState('0');
  const [currency, setCurrency] = useState('COP');

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      const savedMetaAhorro = await AsyncStorage.getItem('meta_ahorro');

      if (savedName) setUserName(savedName);
      if (savedMetaAhorro) {
        // Convertir a número y formatear con separadores de miles
        const formattedSavings = parseInt(savedMetaAhorro, 10).toLocaleString('es-CO');
        setTotalSavings(formattedSavings);
      }
    } catch (error) {
      console.error('Error cargando los datos del usuario:', error);
    }
  };

  useFocusEffect(
    
    useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(loadUserData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency = await AsyncStorage.getItem('currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    };

    const focusListener = setInterval(loadCurrency, 1000); // Verificar cambios cada segundo

    loadCurrency();

    return () => clearInterval(focusListener);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {userName}</Text>
      <Text style={styles.subtitle}>Tu meta actual es:</Text>
      <Text style={styles.savings}>
        {currency} {totalSavings}
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
