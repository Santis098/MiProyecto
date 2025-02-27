import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const [currency, setCurrency] = useState('COP'); // Valor por defecto
  const navigation = useNavigation();

  // Cargar la moneda guardada al iniciar
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('tipo_moneda');
        if (savedCurrency) setCurrency(savedCurrency);
      } catch (error) {
        console.error('Error cargando la moneda:', error);
      }
    };

    loadCurrency();
  }, []);

  // Guardar la moneda seleccionada y actualizar en la base de datos
  const saveCurrency = async (selectedCurrency) => {
    try {
      const userId = await AsyncStorage.getItem('user_id'); // Asegurar que se usa 'user_id' como en SavingsScreen.js

      if (!userId) {
        Alert.alert('Error', 'No se encontró el ID del usuario');
        return;
      }

      const response = await fetch(`http://10.0.2.2:3000/user/${userId}/currency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo_moneda: selectedCurrency }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrency(selectedCurrency);
        await AsyncStorage.setItem('tipo_moneda', selectedCurrency);
        Alert.alert('Éxito', `Moneda cambiada a ${selectedCurrency}`);
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar la moneda');
      }
    } catch (error) {
      console.error('Error al guardar la moneda:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar la moneda');
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
      navigation.replace('Login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
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

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
