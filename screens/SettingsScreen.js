import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [currency, setCurrency] = useState('COP'); // Valor por defecto

  // Cargar la moneda guardada al iniciar
  useEffect(() => {
    const loadCurrency = async () => {
      const storedCurrency = await AsyncStorage.getItem('currency');
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    };
    loadCurrency();
  }, []);

  // Guardar la moneda seleccionada
  const saveCurrency = async (selectedCurrency) => {
    setCurrency(selectedCurrency);
    await AsyncStorage.setItem('currency', selectedCurrency);
    Alert.alert('Éxito', `Moneda cambiada a ${selectedCurrency}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu moneda</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.optionButton, currency === 'COP' && styles.selected]}
          onPress={() => saveCurrency('COP')}
        >
          <Text style={styles.optionText}>Pesos Colombianos (COP)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, currency === 'USD' && styles.selected]}
          onPress={() => saveCurrency('USD')}
        >
          <Text style={styles.optionText}>Dólares (USD)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.currentSelection}>Moneda actual: {currency}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  currentSelection: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});
