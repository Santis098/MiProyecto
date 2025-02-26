import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import CalendarScreen from './CalendarScreen';
import SavingsScreen from './SavingsScreen';
import MotivationScreen from './MotivationScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', height: 60 },
        tabBarActiveTintColor: '#0288d1',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (<Icon name="home" color={color} size={size} />) 
        }} 
      />
      <Tab.Screen 
        name="Ahorro Programado" 
        component={SavingsScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (<Icon name="Savings" color={color} size={size} />) 
        }} 
      />
      <Tab.Screen 
        name="Motivacion" 
        component={MotivationScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (<Icon name="motivation" color={color} size={size} />) 
        }} 
      />
      <Tab.Screen 
        name="Calendario" 
        component={CalendarScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (<Icon name="calendar" color={color} size={size} />) 
        }} 
      />
      <Tab.Screen 
        name="Configuracion" 
        component={SettingsScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (<Icon name="configuracion" color={color} size={size} />) 
        }} 
      />
    </Tab.Navigator>
  );
}
