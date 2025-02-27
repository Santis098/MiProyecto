import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [totalSavings, setTotalSavings] = useState(0);
  const [currency, setCurrency] = useState('COP');

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      const savedMetaAhorro = await AsyncStorage.getItem('meta_ahorro');
      const savedCurrency = await AsyncStorage.getItem('tipo_moneda');

      console.log('📥 Recuperado de AsyncStorage:', savedMetaAhorro); 
      console.log('📥 Recuperado de AsyncStorage:', savedCurrency);

      if (savedCurrency) setCurrency(savedCurrency);
      if (savedName) setUserName(savedName);
      if (savedMetaAhorro !== null) {
        const parsedSavings = parseInt(savedMetaAhorro, 10) || 0;
        setTotalSavings(parsedSavings);
      }
    } catch (error) {
      console.error('❌ Error cargando los datos del usuario:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency = await AsyncStorage.getItem('tipo_moneda');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    };

    const focusListener = setInterval(loadCurrency, 1000); // Verificar cambios cada segundo

    loadCurrency();

    return () => clearInterval(focusListener);
  }, []);


  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('currency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch (error) {
        console.error('❌ Error cargando la moneda:', error);
      }
    };

    loadCurrency();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {userName}</Text>
      <Text style={styles.subtitle}>Tu meta actual es:</Text>
      <Text style={styles.savings}>
        {currency} {totalSavings.toLocaleString('es-CO')}
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
