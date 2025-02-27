import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function MotivationScreen() {
  const [savingsPlan, setSavingsPlan] = useState({ months: 0, weeks: 0, days: 0 });
  const [checkedItems, setCheckedItems] = useState([]);
  const [savingAmounts, setSavingAmounts] = useState({ months: 0, weeks: 0, days: 0 });

  useFocusEffect(
    useCallback(() => {
      const loadSavingsPlan = async () => {
        try {
          console.log('🔄 Cargando savings_plan y checkedItems desde AsyncStorage...');
          const storedPlan = await AsyncStorage.getItem('savings_plan');
          const storedAmounts = await AsyncStorage.getItem('saving_amounts');
          const storedCheckedItems = await AsyncStorage.getItem('checked_items');

          if (storedPlan) {
            const parsedPlan = JSON.parse(storedPlan);
            console.log('✅ Plan de ahorro cargado:', parsedPlan);

            setSavingsPlan(parsedPlan);
            setCheckedItems(storedCheckedItems ? JSON.parse(storedCheckedItems) : new Array(parsedPlan.months + parsedPlan.weeks + parsedPlan.days).fill(false));

            if (storedAmounts) {
              const parsedAmounts = JSON.parse(storedAmounts);
              console.log('✅ Montos de ahorro cargados:', parsedAmounts);
              setSavingAmounts(parsedAmounts);
            } else {
              console.warn('⚠ No se encontró saving_amounts en AsyncStorage.');
            }
          } else {
            console.warn('⚠ No se encontró un plan de ahorro en AsyncStorage.');
          }
        } catch (error) {
          console.error('❌ Error cargando el plan de ahorro:', error);
        }
      };

      loadSavingsPlan();
    }, [])
  );

  const toggleCheckbox = async (index, type) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);

    // Guardar en AsyncStorage
    await AsyncStorage.setItem('checked_items', JSON.stringify(newCheckedItems));

    if (newCheckedItems[index]) {
      console.log(`🔹 Casilla marcada: ${type} - Índice: ${index}`);
      await addSavingsToDatabase(type);
    }
  };

  const addSavingsToDatabase = async (type) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Error', 'Usuario no encontrado');
        return;
      }

      const amountToAdd = savingAmounts[type];

      console.log(`🔍 Monto a agregar (${type}):`, amountToAdd);

      if (!amountToAdd || isNaN(amountToAdd) || amountToAdd <= 0) {
        Alert.alert('Error', `El monto de ahorro para ${type} no es válido (${amountToAdd})`);
        return;
      }

      console.log(`💾 Registrando ahorro de ${amountToAdd} en la base de datos...`);

      const response = await fetch(`http://10.0.2.2:3000/user/${userId}/increment-savings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToAdd }),
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('dinero_ahorrado', String(data.nuevo_dinero_ahorrado));
        Alert.alert('Éxito', `Dinero ahorrado incrementado: ${data.nuevo_dinero_ahorrado}`);
      } else {
        Alert.alert('Error', data.error || 'No se pudo incrementar el ahorro');
      }
    } catch (error) {
      console.error('❌ Error incrementando el ahorro:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tu progreso de ahorro</Text>

      {/* Sección de Meses */}
      {savingsPlan.months > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meses</Text>
          {Array.from({ length: savingsPlan.months }).map((_, index) => (
            <TouchableOpacity
              key={`month-${index}`}
              style={[
                styles.checkbox,
                checkedItems[index] && styles.checked,
                !checkedItems[index - 1] && index > 0 && styles.disabledCheckbox,
              ]}
              onPress={() => toggleCheckbox(index, 'months')}
              disabled={index > 0 && !checkedItems[index - 1]}
            >
              <Text style={styles.checkboxText}>{checkedItems[index] ? '✅' : '🟩'} Mes {index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sección de Semanas */}
      {savingsPlan.weeks > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Semanas</Text>
          {Array.from({ length: savingsPlan.weeks }).map((_, index) => {
            const position = savingsPlan.months + index;
            return (
              <TouchableOpacity
                key={`week-${index}`}
                style={[
                  styles.checkbox,
                  checkedItems[position] && styles.checked,
                  !checkedItems[position - 1] && position > 0 && styles.disabledCheckbox,
                ]}
                onPress={() => toggleCheckbox(position, 'weeks')}
                disabled={position > 0 && !checkedItems[position - 1]}
              >
                <Text style={styles.checkboxText}>{checkedItems[position] ? '✅' : '🟦'} Semana {index + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Sección de Días */}
      {savingsPlan.days > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Días</Text>
          {Array.from({ length: savingsPlan.days }).map((_, index) => {
            const position = savingsPlan.months + savingsPlan.weeks + index;
            return (
              <TouchableOpacity
                key={`day-${index}`}
                style={[
                  styles.checkbox,
                  checkedItems[position] && styles.checked,
                  !checkedItems[position - 1] && position > 0 && styles.disabledCheckbox,
                ]}
                onPress={() => toggleCheckbox(position, 'days')}
                disabled={position > 0 && !checkedItems[position - 1]}
              >
                <Text style={styles.checkboxText}>{checkedItems[position] ? '✅' : '🟥'} Día {index + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  section: {
    width: '100%',
    marginBottom: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#0288d1',
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  checked: {
    backgroundColor: '#81c784',
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
