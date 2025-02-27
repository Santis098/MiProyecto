import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log('📡 Respuesta del servidor:', data);
  
      if (response.ok) {
        await AsyncStorage.setItem('user_id', String(data.usuario.id));
        await AsyncStorage.setItem('user_name', data.usuario.nombre);
  
        if ('meta_ahorro' in data.usuario) {  // ✅ Solo guardar si existe
          const ahorroValue = String(data.usuario.meta_ahorro);
          console.log('✅ Guardando en AsyncStorage meta_ahorro:', ahorroValue);
          await AsyncStorage.setItem('meta_ahorro', ahorroValue);
        } else {
          console.warn('⚠️ El servidor no envió meta_ahorro.');
        }

        if ('tipo_moneda' in data.usuario) {  // ✅ Solo guardar si existe
          const tipoValue = String(data.usuario.tipo_moneda);
          console.log('✅ Guardando en AsyncStorage tipo_moneda:', tipoValue);
          await AsyncStorage.setItem('tipo_moneda', tipoValue);
        } else {
          console.warn('⚠️ El servidor no envió tipo_moneda.');
        }

        if ('dinero_ahorrado' in data.usuario) {  
          const ahorroValue = String(data.usuario.dinero_ahorrado);
          console.log('✅ Guardando en AsyncStorage dinero_ahorrado:', ahorroValue);
          await AsyncStorage.setItem('dinero_ahorrado', ahorroValue);
        } else {
          console.warn('⚠️ El servidor no envió dinero_ahorrado.');
        }
  
        navigation.replace('Home');
      } else {
        Alert.alert('Error', data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      console.error('❌ Error en login:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0277bd',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0288d1',
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
  registerText: {
    marginTop: 15,
    color: '#0288d1',
    fontSize: 14,
  },
});
