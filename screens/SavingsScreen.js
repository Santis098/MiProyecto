import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavingsScreen() {
  const [totalSavings, setTotalSavings] = useState('');
  const [period, setPeriod] = useState('semanas');
  const [periodCount, setPeriodCount] = useState('');
  const [suggestedSaving, setSuggestedSaving] = useState(null);
  const [currency, setCurrency] = useState('COP');
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);


 
    

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('tipo_moneda');
  
        if (savedCurrency) setCurrency(savedCurrency);
      } catch (error) {
        console.error('❌ Error cargando los datos de ahorro:', error);
      }
    };
  
    loadCurrency();// Carga inicial
  
    // Actualiza los valores cada 1 segundo
    const interval = setInterval(loadCurrency, 1000);
  
    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  const formatNumber = (value) => {
    if (!value) return '';
    const rawNumber = value.replace(/\./g, '');
    return parseInt(rawNumber).toLocaleString('es-CO');
  };

  const handleSavingsChange = (value) => {
    if (!value) {
      setTotalSavings('');
      return;
    }
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setTotalSavings(formatNumber(onlyNumbers));
    resetInputs();
  };

  const handlePeriodCountChange = (value) => {
    setPeriodCount(value);
    resetInputs();
  };

  const resetInputs = () => {
    setInputsDisabled(false);
    setButtonDisabled(false);
    setSuggestedSaving(null);
  };

  const calculateSavings = () => {
    const rawSavings = parseInt(totalSavings.replace(/\./g, ''));
    const periods = parseInt(periodCount);

    if (!rawSavings || !periods || periods <= 0) {
      Alert.alert('Error', 'Ingrese valores válidos');
      return;
    }

    const perPeriod = rawSavings / periods;
    setSuggestedSaving(perPeriod.toLocaleString('es-CO', { minimumFractionDigits: 2 }));

    // Bloquear inputs y botón después de calcular
    setInputsDisabled(true);
    setButtonDisabled(true);
  };

  const saveSavings = async () => {
    try {
        const userId = await AsyncStorage.getItem('user_id');
        const savingsValue = parseInt(totalSavings.replace(/\./g, ''));

        if (!savingsValue || savingsValue <= 0) {
            Alert.alert('Error', 'Ingrese un monto válido');
            return;
        }

        const response = await fetch(`http://10.0.2.2:3000/user/${userId}/savings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta_ahorro: savingsValue }),
        });

        const data = await response.json();

        if (response.ok) {
            await AsyncStorage.setItem('meta_ahorro', String(savingsValue));
            Alert.alert('Éxito', 'Meta actualizada correctamente');
        } else {
            Alert.alert('Error', data.error || 'No se pudo actualizar el ahorro');
        }
    } catch (error) {
        console.error('Error guardando el ahorro:', error);
    }
  };

  const incrementSavings = async () => {
    try {
        const userId = await AsyncStorage.getItem('user_id');

        if (!userId) {
            Alert.alert('Error', 'Usuario no encontrado');
            return;
        }

        if (!suggestedSaving) {
            Alert.alert('Error', 'Debe calcular un ahorro antes de incrementarlo');
            return;
        }

        const amountToAdd = parseFloat(suggestedSaving.replace(/\./g, '').replace(',', '.'));

        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            Alert.alert('Error', 'El monto calculado no es válido');
            return;
        }

        const response = await fetch(`http://10.0.2.2:3000/user/${userId}/increment-savings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountToAdd }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Respuesta no válida del servidor:', textResponse);
            Alert.alert('Error', 'Respuesta no válida del servidor');
            return;
        }

        const data = await response.json();

        if (response.ok) {
            await AsyncStorage.setItem('dinero_ahorrado', String(data.nuevo_dinero_ahorrado)); // ✅ Actualiza `AsyncStorage`
            Alert.alert('Éxito', `Dinero ahorrado incrementado: ${data.nuevo_dinero_ahorrado}`);
        } else {
            Alert.alert('Error', data.error || 'No se pudo incrementar el ahorro');
        }
    } catch (error) {
        console.error('Error incrementando el ahorro:', error);
    }
};


  const resetForm = () => {
    setTotalSavings('');
    setPeriod('semanas');
    setPeriodCount('');
    setSuggestedSaving(null);
    setInputsDisabled(false);
    setButtonDisabled(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan de Ahorro ({currency})</Text>

      <TextInput
        style={[styles.input, inputsDisabled && styles.disabledInput]}
        placeholder={`Cantidad total a ahorrar (${currency})`}
        keyboardType="numeric"
        value={totalSavings}
        onChangeText={handleSavingsChange}
        editable={!inputsDisabled}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.optionButton, period === 'semanas' && styles.selected]}
          onPress={() => setPeriod('semanas')}
          disabled={inputsDisabled}
        >
          <Text style={styles.optionText}>Semanas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, period === 'meses' && styles.selected]}
          onPress={() => setPeriod('meses')}
          disabled={inputsDisabled}
        >
          <Text style={styles.optionText}>Meses</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, inputsDisabled && styles.disabledInput]}
        placeholder={`Cantidad de ${period}`}
        keyboardType="numeric"
        value={periodCount}
        onChangeText={handlePeriodCountChange}
        editable={!inputsDisabled}
      />

      <TouchableOpacity
        style={[styles.button, buttonDisabled && styles.disabledButton]}
        onPress={calculateSavings}
        disabled={buttonDisabled}
      >
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={incrementSavings}>
        <Text style={styles.buttonText}>Incrementar dinero ahorrado</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={resetForm}>
        <Text style={styles.buttonText}>Recalcular</Text>
      </TouchableOpacity>

      {suggestedSaving && (
        <Text style={styles.resultText}>
          Debes ahorrar {currency} {suggestedSaving} cada {period}
        </Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveSavings}>
        <Text style={styles.buttonText}>Establecer meta</Text>
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
  disabledInput: { backgroundColor: '#e0e0e0', color: '#888' },
  disabledButton: { backgroundColor: '#bbb' },
});