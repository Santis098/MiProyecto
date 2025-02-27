import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import moment from 'moment';
import 'moment/locale/es';

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [amount, setAmount] = useState('');
  const [savingsPlan, setSavingsPlan] = useState('');

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

  const selectDate = (day) => {
    if (day.isBefore(moment(), 'day')) {
      Alert.alert('Error', 'No puedes seleccionar una fecha pasada.');
      return;
    }
    setSelectedDate(day);
  };

  const calculateSavings = () => {
    if (!selectedDate || !amount || isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Selecciona una fecha válida y un monto positivo.');
      return;
    }

    const totalAmount = parseFloat(amount);
    const today = moment().startOf('day');
    const targetDate = selectedDate.clone().startOf('day');
    const totalDays = targetDate.diff(today, 'days');

    let weeks = Math.floor(totalDays / 7);
    let remainingDays = totalDays % 7;

    let weeklyAmount = 0;
    let dailyAmount = 0;

    if (weeks > 0) {
      weeklyAmount = (totalAmount * 7) / (weeks * 7 + remainingDays);
    }

    if (remainingDays > 0) {
      dailyAmount = totalAmount / (weeks * 7 + remainingDays);
    }

    let plan = '';

    if (weeks > 0) {
      plan += `Debes ahorrar ${weeklyAmount.toFixed(2)} por semana durante ${weeks} semanas.\n`;
    }
    if (remainingDays > 0) {
      plan += `Debes ahorrar ${dailyAmount.toFixed(2)} por día durante ${remainingDays} días.`;
    }

    setSavingsPlan(plan);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentMonth(moment(currentMonth).subtract(1, 'month'))} style={styles.navButton}>
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(moment(currentMonth).add(1, 'month'))} style={styles.navButton}>
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
              day && selectedDate && day.isSame(selectedDate, 'day') && styles.selectedDay,
            ]}
            onPress={() => day && selectDate(day)}
            disabled={!day}
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
        placeholder="Ingrese el monto a ahorrar"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity onPress={calculateSavings} style={styles.calculateButton}>
        <Text style={styles.calculateText}>Calcular Ahorro</Text>
      </TouchableOpacity>

      {savingsPlan ? <Text style={styles.result}>{savingsPlan}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 24,
    color: '#0288d1',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288d1',
    marginHorizontal: 20,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 5,
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288d1',
    width: '14.28%',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 10,
    backgroundColor: '#bbdefb',
  },
  today: {
    backgroundColor: '#0288d1',
  },
  selectedDay: {
    backgroundColor: '#ffab00',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  todayText: {
    color: '#fff',
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#0288d1',
    borderRadius: 5,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  calculateButton: {
    backgroundColor: '#0288d1',
    padding: 10,
    borderRadius: 5,
  },
  calculateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
});
