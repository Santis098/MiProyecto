import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const [savingAmount, setSavingAmount] = useState('');
  const [savingsPlan, setSavingsPlan] = useState('');
  const [currency, setCurrency] = useState('COP');

  // Cargar moneda cuando la pantalla recibe enfoque
  useFocusEffect(
    useCallback(() => {
      const loadCurrency = async () => {
        try {
          const savedCurrency = await AsyncStorage.getItem('tipo_moneda');
          if (savedCurrency) setCurrency(savedCurrency);
        } catch (error) {
          console.error('❌ Error cargando la moneda:', error);
        }
      };

      loadCurrency();
    }, [])
  );

  const generateDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const days = [];

    for (let i = 0; i < startOfMonth.day(); i++) {
      days.push(null);
    }

    for (let day = 1; day <= endOfMonth.date(); day++) {
      days.push(moment(currentMonth).date(day));
    }

    return days;
  };

  const selectDay = (day) => {
    if (day.isBefore(moment(), 'day')) return; // No permitir fechas pasadas
    setSelectedDay(day);
  };

  const formatNumber = (num) => num.toLocaleString('es-CO');

  // Función para guardar el plan en AsyncStorage
// Función para guardar el plan en AsyncStorage
const saveSavingsPlan = async (plan, savingAmounts) => {
  try {
    await AsyncStorage.setItem('savings_plan', JSON.stringify(plan));
    await AsyncStorage.setItem('saving_amounts', JSON.stringify(savingAmounts)); // Guardamos los montos
    console.log('✅ Plan de ahorro guardado:', plan);
    console.log('✅ Montos de ahorro guardados:', savingAmounts);
  } catch (error) {
    console.error('❌ Error guardando el plan de ahorro:', error);
  }
};

const calculateSavingsPlan = async () => {
  console.log('▶ Iniciando cálculo de plan de ahorro...');
  
  if (!selectedDay || !savingAmount) {
    console.warn('⚠ No hay una fecha o monto ingresado.');
    return;
  }

  const targetDate = moment(selectedDay);
  const today = moment();
  const totalDays = targetDate.diff(today, 'days');

  if (totalDays < 1) {
    setSavingsPlan('La fecha seleccionada no es válida.');
    console.warn('⚠ Fecha inválida seleccionada.');
    return;
  }

  const totalAmount = parseFloat(savingAmount.replace(/\./g, '')) || 0;
  let plan = '';
  let savingsData = { months: 0, weeks: 0, days: 0 };
  let savingAmounts = { months: 0, weeks: 0, days: 0 }; // Montos a guardar

  console.log('📅 Días hasta la meta:', totalDays);
  console.log('💰 Monto total:', totalAmount);

  if (totalDays <= 7) {
    const dailyAmount = totalAmount / totalDays;
    plan = `Debes ahorrar ${currency} ${formatNumber(dailyAmount)} por día durante ${totalDays} días.`;
    savingsData.days = totalDays;
    savingAmounts.days = dailyAmount;
  } else if (totalDays <= 28) {
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const weeklyAmount = totalAmount / (weeks + (remainingDays / 7));
    plan = `Debes ahorrar ${currency} ${formatNumber(weeklyAmount)} por semana durante ${weeks} semana(s)`;
    
    savingsData.weeks = weeks;
    savingAmounts.weeks = weeklyAmount;

    if (remainingDays > 0) {
      const dailyAmount = weeklyAmount / 7;
      plan += ` y ${currency} ${formatNumber(dailyAmount)} por día durante ${remainingDays} día(s).`;
      savingsData.days = remainingDays;
      savingAmounts.days = dailyAmount;
    }
  } else {
    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;
    const weeks = Math.floor(remainingDays / 7);
    const extraDays = remainingDays % 7;
    const monthlyAmount = totalAmount / (months + (weeks / 4) + (extraDays / 30));
    plan = `Debes ahorrar ${currency} ${formatNumber(monthlyAmount)} por mes durante ${months} mes(es)`;

    savingsData.months = months;
    savingAmounts.months = monthlyAmount;

    if (weeks > 0) {
      const weeklyAmount = monthlyAmount / 4;
      plan += `, ${currency} ${formatNumber(weeklyAmount)} por semana durante ${weeks} semana(s)`;
      savingsData.weeks = weeks;
      savingAmounts.weeks = weeklyAmount;
    }
    if (extraDays > 0) {
      const dailyAmount = monthlyAmount / 30;
      plan += ` y ${currency} ${formatNumber(dailyAmount)} por día durante ${extraDays} día(s).`;
      savingsData.days = extraDays;
      savingAmounts.days = dailyAmount;
    }
  }

  console.log('📊 Plan de ahorro generado:', plan);
  console.log('📁 Datos a guardar:', savingsData);
  console.log('💰 Montos de ahorro:', savingAmounts);

  setSavingsPlan(plan);
  await saveSavingsPlan(savingsData, savingAmounts); // Guardar en AsyncStorage
};


  


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentMonth((prev) => moment(prev).subtract(1, 'month'))} style={styles.navButton}>
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth((prev) => moment(prev).add(1, 'month'))} style={styles.navButton}>
          <Text style={styles.navText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {generateDays().map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.day,
              day && day.isSame(moment(), 'day') && styles.today,
              day && selectedDay && day.isSame(selectedDay, 'day') && styles.selectedDay,
            ]}
            onPress={() => day && selectDay(day)}
            disabled={!day || day.isBefore(moment(), 'day')}
          >
            <Text style={[styles.dayText, day && day.isSame(moment(), 'day') && styles.todayText]}>
              {day ? day.date() : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Monto a ahorrar"
        value={savingAmount}
        onChangeText={(text) => {
          const formattedText = text.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          setSavingAmount(formattedText);
        }}
      />

      <TouchableOpacity style={styles.calculateButton} onPress={calculateSavingsPlan}>
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      {savingsPlan ? <Text style={styles.savingsPlan}>{savingsPlan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: 'center', backgroundColor: '#e3f2fd' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  navButton: { padding: 10 },
  navText: { fontSize: 24, color: '#0288d1' },
  monthText: { fontSize: 20, fontWeight: 'bold', color: '#0288d1', marginHorizontal: 20 },
  weekDays: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 5 },
  weekDayText: { fontSize: 16, fontWeight: 'bold', color: '#0288d1', width: '14.28%', textAlign: 'center' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '90%' },
  day: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 10, backgroundColor: '#bbdefb' },
  today: { backgroundColor: '#0288d1' },
  selectedDay: { backgroundColor: '#ffab00' },
  dayText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  todayText: { color: '#fff' },
  input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 10, marginVertical: 10, textAlign: 'center', fontSize: 18 },
  calculateButton: { backgroundColor: '#0288d1', padding: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18 },
  savingsPlan: { marginTop: 20, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
