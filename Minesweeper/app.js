import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainPage from './screens/MainPage'; // Ensure this component exists
import Minesweeper from './screens/Minesweeper';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen name="MainPage" component={MainPage} />
        <Stack.Screen name="Minesweeper" component={Minesweeper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
