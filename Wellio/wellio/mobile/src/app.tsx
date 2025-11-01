import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectScreen from './screens/ConnectScreen';
import DashboardScreen from './screens/DashboardScreen';

export type RootStackParamList = {
  Connect: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connect">
        <Stack.Screen name="Connect" component={ConnectScreen} options={{ title: 'Connect Sources' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Wellio Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
