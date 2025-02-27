import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavingsScreen() {
  const [totalSavings, setTotalSavings] = useState('');
  const [period, setPeriod] = useState('semanas');
  const [periodCount, setPeriodCount] = useState('');
  const [suggestedSaving, setSuggestedSaving] = useState(null);
  const [currency, setCurrency] = useState('COP');

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

  // Función para formatear con separadores de miles
  const formatNumber = (value) => {
    if (!value) return ''; // Evitar errores con valores vacíos
    const rawNumber = value.replace(/\./g, ''); // Eliminar puntos previos
    return parseInt(rawNumber).toLocaleString('es-CO'); // Formatear con separadores de miles
  };

  // Manejo del cambio en el input
  const handleSavingsChange = (value) => {
    if (!value) {
      setTotalSavings('');
      return;
    }
    const onlyNumbers = value.replace(/[^0-9]/g, ''); // Permitir solo números
    setTotalSavings(formatNumber(onlyNumbers)); // Formatear y actualizar
  };

  const calculateSavings = () => {
    const rawSavings = parseInt(totalSavings.replace(/\./g, '')); // Convertir a número sin puntos
    const periods = parseInt(periodCount);

    if (!rawSavings || !periods || periods <= 0) {
      Alert.alert('Error', 'Ingrese valores válidos');
      return;
    }

    const perPeriod = rawSavings / periods;
    setSuggestedSaving(perPeriod.toLocaleString('es-CO', { minimumFractionDigits: 2 }));
  };

  const saveSavings = async () => {
    try {
        const userId = await AsyncStorage.getItem('user_id');
        const savingsValue = parseInt(totalSavings.replace(/\./g, ''));

        if (!savingsValue || savingsValue <= 0) {
            Alert.alert('Error', 'Ingrese un monto válido');
            return;
        }

        const API_URL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000' 
        : 'http://localhost:3000';

        const response = await fetch(`${API_URL}/user/${userId}/savings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta_ahorro: savingsValue }),
        });

        const data = await response.json();
        
        if (response.ok) {
            await AsyncStorage.setItem('meta_ahorro', String(savingsValue));
            Alert.alert('Éxito', 'Ahorro actualizado correctamente');
        } else {
            Alert.alert('Error', data.error || 'No se pudo actualizar el ahorro');
        }
    } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
};  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan de Ahorro ({currency})</Text>

      <TextInput
        style={styles.input}
        placeholder={`Cantidad total a ahorrar (${currency})`}
        keyboardType="numeric"
        value={totalSavings}
        onChangeText={handleSavingsChange}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.optionButton, period === 'semanas' && styles.selected]}
          onPress={() => setPeriod('semanas')}
        >
          <Text style={styles.optionText}>Semanas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, period === 'meses' && styles.selected]}
          onPress={() => setPeriod('meses')}
        >
          <Text style={styles.optionText}>Meses</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={`Cantidad de ${period}`}
        keyboardType="numeric"
        value={periodCount}
        onChangeText={setPeriodCount}
      />

      <TouchableOpacity style={styles.button} onPress={calculateSavings}>
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      {suggestedSaving && (
        <Text style={styles.resultText}>
          Debes ahorrar {currency} {suggestedSaving} cada {period}
        </Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveSavings}>
        <Text style={styles.buttonText}>Guardar Ahorro</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
  },
});
