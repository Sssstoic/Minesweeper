import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainPage from './components/mainpage'; 
import Minesweeper from './components/minesweeper'; 

// Define the parameters for your navigation stack
type RootStackParamList = {
  MainPage: undefined; // No parameters for MainPage
  Minesweeper: { difficulty: number }; // Parameter for Minesweeper
};

// Create a stack navigator with the defined parameter list
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen name="MainPage" component={MainPage} />
        <Stack.Screen name="Minesweeper" component={Minesweeper} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
