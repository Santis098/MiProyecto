import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [totalSavings, setTotalSavings] = useState('0');
  const [currency, setCurrency] = useState('COP');

  useEffect(() => {
    const loadSavings = async () => {
      const savedAmount = await AsyncStorage.getItem('savings');
      const savedCurrency = await AsyncStorage.getItem('currency');

      if (savedAmount) {
        setTotalSavings(savedAmount);
      }

      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    };

    const focusListener = setInterval(loadSavings, 1000); // Verificar cambios cada segundo

    loadSavings();

    return () => clearInterval(focusListener);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
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
